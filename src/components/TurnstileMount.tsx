import { useEffect, useRef } from 'react';
import { renderTurnstile } from '../turnstile';

export default function TurnstileMount() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const render = () => {
      if (window.turnstile && ref.current) {
        renderTurnstile(ref.current);
        return true;
      }
      return false;
    };

    if (render()) return;

    const id = window.setInterval(() => {
      if (render()) window.clearInterval(id);
    }, 200);

    return () => window.clearInterval(id);
  }, []);

  return <div ref={ref} style={{ position: 'absolute', zIndex: -1 }} />;
}
