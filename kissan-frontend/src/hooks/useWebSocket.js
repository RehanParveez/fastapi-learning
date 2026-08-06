import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8003/ws';

const EVENT_META = {
  advance_disbursed:      { title: 'Advance Disbursed',      color: 'bg-green-100 text-green-800 border-green-200' },
  advance_overdue:        { title: 'Advance Overdue',        color: 'bg-red-100 text-red-800 border-red-200' },
  advance_repaid:         { title: 'Repayment Recorded',     color: 'bg-blue-100 text-blue-800 border-blue-200' },
  contract_allocated:     { title: 'Contract Allocated',     color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  contract_demand_unmet:  { title: 'Demand Nearing Deadline',color: 'bg-amber-100 text-amber-800 border-amber-200' },
  delivery_recorded:      { title: 'Delivery Recorded',      color: 'bg-purple-100 text-purple-800 border-purple-200' },
  payment_settled:        { title: 'Payment Settled',        color: 'bg-green-100 text-green-800 border-green-200' },
  credit_offer_received:  { title: 'Credit Offer Received',  color: 'bg-sky-100 text-sky-800 border-sky-200' },
  input_order_placed:     { title: 'New Order Placed',       color: 'bg-stone-100 text-stone-800 border-stone-200' },
};

export function useWebSocket(token) {
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const attempts = useRef(0);
  const maxAttempts = 5;

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((event, data) => {
    const meta = EVENT_META[event] || { title: event, color: 'bg-stone-100 text-stone-800 border-stone-200' };
    const id = Date.now() + Math.random().toString(36).slice(2);
    const toast = { id, event, data, meta, createdAt: Date.now() };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), 6000);
  }, [removeToast]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }

    function connect() {
      try {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          attempts.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event) {
              addToast(payload.event, payload.data);
            }
          } catch {

          }
        };

        ws.onclose = (ev) => {
          setConnected(false);
          wsRef.current = null;
    
          if (ev.code === 4401) return;
          if (attempts.current < maxAttempts) {
            const delay = Math.min(1000 * 2 ** attempts.current, 30000);
            attempts.current += 1;
            reconnectTimer.current = setTimeout(connect, delay);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
    
      }
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, addToast]);

  return { connected, toasts, removeToast };
}