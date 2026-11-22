import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import type { CertificateInfo } from '../types/api';

type InspectionStatus = 'idle' | 'uploading' | 'done' | 'error';

interface InspectionState {
  status: InspectionStatus;
  result: CertificateInfo | null;
  error: string | null;
}

const initialState: InspectionState = {
  status: 'idle',
  result: null,
  error: null,
};

export function useInspection(endpoint: string) {
  const [state, setState] = useState<InspectionState>(initialState);
  const runIdRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    requestRef.current?.abort();
    setState(initialState);
  }, []);

  const inspect = useCallback(async (file: File, password?: string) => {
    const runId = ++runIdRef.current;
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;
    setState({ status: 'uploading', result: null, error: null });

    try {
      const result = await apiClient.submitInspection(endpoint, file, password, request.signal);
      if (runIdRef.current !== runId) return;
      setState({ status: 'done', result, error: null });
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setState({
        status: 'error',
        result: null,
        error: err instanceof Error ? err.message : 'Failed to inspect certificate.',
      });
    }
  }, [endpoint]);

  const inspectText = useCallback(async (pem: string) => {
    const runId = ++runIdRef.current;
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;
    setState({ status: 'uploading', result: null, error: null });

    try {
      const result = await apiClient.submitInspectionText(`${endpoint}/text`, pem, request.signal);
      if (runIdRef.current !== runId) return;
      setState({ status: 'done', result, error: null });
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setState({
        status: 'error',
        result: null,
        error: err instanceof Error ? err.message : 'Failed to parse certificate.',
      });
    }
  }, [endpoint]);

  useEffect(() => () => {
    runIdRef.current += 1;
    requestRef.current?.abort();
  }, []);

  return {
    ...state,
    inspect,
    inspectText,
    reset,
  };
}
