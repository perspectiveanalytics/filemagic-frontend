import { useState, useCallback } from 'react';
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

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const inspect = useCallback(async (file: File, password?: string) => {
    setState({ status: 'uploading', result: null, error: null });

    try {
      const result = await apiClient.submitInspection(endpoint, file, password);
      setState({ status: 'done', result, error: null });
    } catch (err) {
      setState({
        status: 'error',
        result: null,
        error: err instanceof Error ? err.message : 'Failed to inspect certificate.',
      });
    }
  }, [endpoint]);

  const inspectText = useCallback(async (pem: string) => {
    setState({ status: 'uploading', result: null, error: null });

    try {
      const result = await apiClient.submitInspectionText(`${endpoint}/text`, pem);
      setState({ status: 'done', result, error: null });
    } catch (err) {
      setState({
        status: 'error',
        result: null,
        error: err instanceof Error ? err.message : 'Failed to parse certificate.',
      });
    }
  }, [endpoint]);

  return {
    ...state,
    inspect,
    inspectText,
    reset,
  };
}
