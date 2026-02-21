import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { ConversionStatus, JobStatusResponse, FileManifestEntry } from '../types/api';

interface MultiFileState {
  status: ConversionStatus;
  jobId: string | null;
  position: number;
  error: string | null;
  files: FileManifestEntry[];
  zipDownloadUrl: string | null;
}

const POLL_INTERVAL = 1500;
const POLL_INTERVAL_MAX = 5000;
const POLL_BACKOFF = 1.3;
const POLL_TIMEOUT = 5 * 60 * 1000;

const initialState: MultiFileState = {
  status: 'idle',
  jobId: null,
  position: 0,
  error: null,
  files: [],
  zipDownloadUrl: null,
};

export function useMultiFileConversion(endpoint: string) {
  const [state, setState] = useState<MultiFileState>(initialState);

  const pollIntervalRef = useRef<number | null>(null);
  const pollStartRef = useRef<number>(0);
  const pollDelayRef = useRef<number>(POLL_INTERVAL);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setState(initialState);
  }, [stopPolling]);

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
        const files = (response.metadata?.files as FileManifestEntry[]) || [];
        setState(prev => ({
          ...prev,
          status: 'done',
          files,
          zipDownloadUrl: apiClient.getZipDownloadUrl(jobId),
        }));
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
        error: err instanceof Error ? err.message : 'Failed to check status.',
      }));
    }
  }, [stopPolling]);

  const startConversion = useCallback(async (file: File, password?: string) => {
    reset();
    setState(prev => ({ ...prev, status: 'uploading' }));

    try {
      const response = await apiClient.submitDecompress(endpoint, file, password);

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

  const startConversionWithOptions = useCallback(async (file: File, options: Record<string, unknown>) => {
    reset();
    setState(prev => ({ ...prev, status: 'uploading' }));

    try {
      const response = await apiClient.submitConversion(endpoint, file, options as never);

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

  const getFileUrl = useCallback((index: number) => {
    if (!state.jobId) return '';
    return apiClient.getFileDownloadUrl(state.jobId, index);
  }, [state.jobId]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    ...state,
    startConversion,
    startConversionWithOptions,
    reset,
    getFileUrl,
  };
}
