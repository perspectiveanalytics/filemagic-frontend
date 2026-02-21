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

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    blobRef.current = null;
    setState(initialState);
  }, [stopPolling, state.previewUrl]);

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

      if (blob.type.startsWith('image/') && blob.type !== 'image/tiff') {
        const previewUrl = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, previewUrl }));
      } else if (blob.type.startsWith('text/') || name.endsWith('.txt')) {
        const text = await blob.text();
        setState(prev => ({ ...prev, textContent: text }));
      }
    } catch {
      // Preview/text fetch failed — set textContent so OCR page doesn't stay on "Loading..."
      setState(prev => prev.textContent === null && prev.previewUrl === null
        ? { ...prev, textContent: '' }
        : prev);
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    if (Date.now() - pollStartRef.current > POLL_TIMEOUT) {
      stopPolling();
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Conversion timed out. Please try again.',
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
          inputSize: response.inputSize || null,
          outputSize: response.outputSize || null,
          metadata: response.metadata || null,
        }));
        fetchResult(downloadUrl);
      } else if (response.status === 'error') {
        stopPolling();
        setState(prev => ({
          ...prev,
          status: 'error',
          error: response.error || 'Conversion failed.',
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
        error: err instanceof Error ? err.message : 'Failed to check conversion status.',
      }));
    }
  }, [stopPolling, fetchResult]);

  const startConversion = useCallback(async (file: File, options: ConversionOptions, endpointOverride?: string) => {
    reset();
    setState(prev => ({ ...prev, status: 'uploading' }));

    try {
      const response = await apiClient.submitConversion(endpointOverride || endpoint, file, options);

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
        error: err instanceof Error ? err.message : 'Failed to start conversion.',
      }));
    }
  }, [endpoint, reset, pollStatus]);

  const download = useCallback(() => {
    if (blobRef.current) {
      const url = URL.createObjectURL(blobRef.current.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = blobRef.current.name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } else if (state.downloadUrl) {
      window.location.href = state.downloadUrl;
    }
    setTimeout(reset, 1000);
  }, [state.downloadUrl, reset]);

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
