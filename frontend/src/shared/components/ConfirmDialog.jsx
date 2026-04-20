import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ abierto, onCerrar, onConfirmar, titulo, mensaje, conMotivo = false, cargando = false }) {
  const [motivo, setMotivo] = useState('');

  const handleConfirmar = () => {
    onConfirmar(conMotivo ? motivo : undefined);
    setMotivo('');
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <p className="mb-4 text-sm text-gray-600">{mensaje}</p>

      {conMotivo && (
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo (obligatorio)"
          rows={3}
          className="mb-4 w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCerrar}
          className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirmar}
          disabled={cargando || (conMotivo && !motivo.trim())}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? 'Procesando...' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}
