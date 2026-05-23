import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { ConversionStatus, JobStatusResponse } from '../types/api';

interface ArchiveConversionState {
  status: ConversionStatus;
  jobId: string | null;
  position: number;
  error: string | null;
  downloadUrl: string | null;
  outputSize: number | null;
}

const POLL_INTERVAL = 1500;
const POLL_INTERVAL_MAX = 5000;
const POLL_BACKOFF = 1.3;
const POLL_TIMEOUT = 5 * 60 * 1000;

const initialState: ArchiveConversionState = {
  status: 'idle',
  jobId: null,
  position: 0,
  error: null,
  downloadUrl: null,
  outputSize: null,
};

export function useArchiveConversion(endpoint: string) {
  const [state, setState] = useState<ArchiveConversionState>(initialState);

  const pollIntervalRef = useRef<number | null>(null);
  const pollStartRef = useRef<number>(0);
  const pollDelayRef = useRef<number>(POLL_INTERVAL);
  const blobRef = useRef<{ blob: Blob; name: string } | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    blobRef.current = null;
    setState(initialState);
  }, [stopPolling]);

  const fetchResult = useCallback(async (url: string) => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) return;

      const contentDisposition = resp.headers.get('Content-Disposition');
      let name = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) name = match[1];
      }

      const blob = await resp.blob();
      blobRef.current = { blob, name };
    } catch {
      // Download will still work via URL fallback
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    if (Date.now() - pollStartRef.current > POLL_TIMEOUT) {
      stopPolling();
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Archive creation timed out. Please try again.',
      }));
      return;
    }

    try {
      const response: JobStatusResponse = await apiClient.pollJobStatus(jobId);

      if (response.status === 'done') {
        stopPolling();
        const downloadUrl = apiClient.getDownloadUrl(jobId);
        setState(prev => ({
          ...prev,
          status: 'done',
          downloadUrl,
          outputSize: response.outputSize || null,
        }));
        fetchResult(downloadUrl);
      } else if (response.status === 'error') {
        stopPolling();
        setState(prev => ({
          ...prev,
          status: 'error',
          error: response.error || 'Archive creation failed.',
        }));
      } else {
        setState(prev => ({
          ...prev,
          status: response.status === 'processing' ? 'processing' : 'queued',
          position: response.position,
        }));
        pollIntervalRef.current = window.setTimeout(() => pollStatus(jobId), pollDelayRef.current);
        pollDelayRef.current = Math.min(pollDelayRef.current * POLL_BACKOFF, POLL_INTERVAL_MAX);
      }
    } catch (err) {
      stopPolling();
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to check status.',
      }));
    }
  }, [stopPolling, fetchResult]);

  const startConversion = useCallback(async (
    files: File[],
    format: string,
    password?: string
  ) => {
    reset();
    setState(prev => ({ ...prev, status: 'uploading' }));

    try {
      const response = await apiClient.submitArchive(endpoint, files, format, password);

      setState(prev => ({
        ...prev,
        status: 'queued',
        jobId: response.jobId,
        position: response.position,
      }));

      pollStartRef.current = Date.now();
      pollDelayRef.current = POLL_INTERVAL;
      pollStatus(response.jobId);
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to create archive.',
      }));
    }
  }, [endpoint, reset, pollStatus]);

  // Serve from the in-memory blob only. The server download is single-use
  // (consumed by fetchResult), so falling back to the URL would 404. Keep the
  // blob so re-taps re-save; reset happens via "New"/onRetry.
  const download = useCallback(() => {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = blobRef.current.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    ...state,
    startConversion,
    reset,
    download,
  };
}
