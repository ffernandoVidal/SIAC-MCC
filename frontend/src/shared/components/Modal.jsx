import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg' }) {
  const refOverlay = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div
      ref={refOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === refOverlay.current) onCerrar(); }}
    >
      <div className={`w-full ${ancho} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
