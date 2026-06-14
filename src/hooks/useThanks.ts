import { useState, useCallback, useSyncExternalStore } from 'react';
import { apiClient } from '../api/client';

const UPLOADED_KEY = 'fm_uploaded';
const THANKED_KEY = 'fm_thanked';

// Shared in-memory state so all hook consumers stay in sync without React Context.
let listeners: Array<() => void> = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function notify() {
  listeners.forEach((l) => l());
}

function getHasUploaded() {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(UPLOADED_KEY) === '1';
}
function getHasThanked() {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(THANKED_KEY) === '1';
}

export function useThanks() {
  const hasUploaded = useSyncExternalStore(subscribe, getHasUploaded, () => false);
  const hasThanked = useSyncExternalStore(subscribe, getHasThanked, () => false);
  const [sending, setSending] = useState(false);

  const markUploaded = useCallback(() => {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(UPLOADED_KEY) !== '1') {
      localStorage.setItem(UPLOADED_KEY, '1');
      notify();
    }
  }, []);

  const markThanked = useCallback(async () => {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(THANKED_KEY) === '1') return;
    localStorage.setItem(THANKED_KEY, '1');
    notify();
    setSending(true);
    try {
      await apiClient.postThanks();
    } catch {
      // Best effort — button already hidden.
    } finally {
      setSending(false);
    }
  }, []);

  const showThanks = hasUploaded && !hasThanked;

  return { hasUploaded, hasThanked, showThanks, sending, markUploaded, markThanked };
}
