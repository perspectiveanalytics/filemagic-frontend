import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { ConversionOptions, ConversionStatus, JobStatusResponse } from '../types/api';

interface ConversionState {
  status: ConversionStatus;
  jobId: string | null;
  position: number;
  error: string | null;
  downloadUrl: string | null;
  inputSize: number | null;
  outputSize: number | null;
  previewUrl: string | null;
  textContent: string | null;
  metadata: Record<string, unknown> | null;
}

const POLL_INTERVAL = 1500;
const POLL_INTERVAL_MAX = 5000;
const POLL_BACKOFF = 1.3;
const POLL_TIMEOUT = 5 * 60 * 1000;

const initialState: ConversionState = {
  status: 'idle',
  jobId: null,
  position: 0,
  error: null,
  downloadUrl: null,
  inputSize: null,
  outputSize: null,
  previewUrl: null,
  textContent: null,
  metadata: null,
};

export function useConversion(endpoint: string) {
  const [state, setState] = useState<ConversionState>(initialState);

  const pollIntervalRef = useRef<number | null>(null);
  const pollStartRef = useRef<number>(0);
  const pollDelayRef = useRef<number>(POLL_INTERVAL);
  const blobRef = useRef<{ blob: Blob; name: string } | null>(null);
  const runIdRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    stopPolling();
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    blobRef.current = null;
    setState(initialState);
  }, [stopPolling, state.previewUrl]);

  const fetchResult = useCallback(async (url: string, runId: number) => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) return false;

      const contentDisposition = resp.headers.get('Content-Disposition');
      let name = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) name = match[1];
      }

      const blob = await resp.blob();
      if (runIdRef.current !== runId) return false;

      blobRef.current = { blob, name };

      try {
        if (blob.type.startsWith('image/') && blob.type !== 'image/tiff') {
          const previewUrl = URL.createObjectURL(blob);
          if (runIdRef.current !== runId) {
            URL.revokeObjectURL(previewUrl);
            return false;
          }
          setState(prev => ({ ...prev, previewUrl }));
        } else if (blob.type.startsWith('text/') || name.endsWith('.txt')) {
          const text = await blob.text();
          if (runIdRef.current !== runId) return false;
          setState(prev => ({ ...prev, textContent: text }));
        }
      } catch {
        if (blob.type.startsWith('text/') || name.endsWith('.txt')) {
          if (runIdRef.current !== runId) return false;
          setState(prev => ({ ...prev, textContent: '' }));
        }
      }
      return true;
    } catch {
      if (runIdRef.current !== runId) return false;
      setState(prev => prev.textContent === null && prev.previewUrl === null
        ? { ...prev, textContent: '' }
        : prev);
      return false;
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string, runId: number) => {
    if (runIdRef.current !== runId) return;

    if (Date.now() - pollStartRef.current > POLL_TIMEOUT) {
      stopPolling();
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Processing timed out. Please try again.',
      }));
      return;
    }

    try {
      const response: JobStatusResponse = await apiClient.pollJobStatus(jobId);
      if (runIdRef.current !== runId) return;

      if (response.status === 'done') {
        stopPolling();
        const downloadUrl = apiClient.getDownloadUrl(jobId);
        const resultReady = await fetchResult(downloadUrl, runId);
        if (runIdRef.current !== runId) return;

        if (!resultReady) {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: 'Download failed. Please try again.',
          }));
          return;
        }
        setState(prev => ({
          ...prev,
          status: 'done',
          downloadUrl,
          inputSize: response.inputSize || null,
          outputSize: response.outputSize || null,
          metadata: response.metadata || null,
        }));
      } else if (response.status === 'error') {
        stopPolling();
        setState(prev => ({
          ...prev,
          status: 'error',
          error: response.error || 'Processing failed.',
        }));
      } else {
        setState(prev => ({
          ...prev,
          status: response.status === 'processing' ? 'processing' : 'queued',
          position: response.position,
        }));
        pollIntervalRef.current = window.setTimeout(() => pollStatus(jobId, runId), pollDelayRef.current);
        pollDelayRef.current = Math.min(pollDelayRef.current * POLL_BACKOFF, POLL_INTERVAL_MAX);
      }
    } catch (err) {
      if (runIdRef.current !== runId) return;
      stopPolling();
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to check status.',
      }));
    }
  }, [stopPolling, fetchResult]);

  const startConversion = useCallback(async (file: File, options: ConversionOptions, endpointOverride?: string) => {
    reset();
    const runId = runIdRef.current;
    setState(prev => ({ ...prev, status: 'uploading' }));

    try {
      const response = await apiClient.submitConversion(endpointOverride || endpoint, file, options);
      if (runIdRef.current !== runId) return;

      setState(prev => ({
        ...prev,
        status: 'queued',
        jobId: response.jobId,
        position: response.position,
      }));

      pollStartRef.current = Date.now();
      pollDelayRef.current = POLL_INTERVAL;
      pollStatus(response.jobId, runId);
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to start processing.',
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
      runIdRef.current += 1;
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
