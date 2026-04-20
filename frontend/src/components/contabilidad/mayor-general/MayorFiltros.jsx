export default function MayorFiltros({ filtros, onChange }) {
  const set = (campo, valor) => onChange({ ...filtros, [campo]: valor, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Cuenta (código)</label>
        <input
          type="text"
          value={filtros.codigo_cuenta || ''}
          onChange={(e) => set('codigo_cuenta', e.target.value)}
          placeholder="Ej. 1101"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Desde</label>
        <input
          type="date"
          value={filtros.fecha_desde || ''}
          onChange={(e) => set('fecha_desde', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Hasta</label>
        <input
          type="date"
          value={filtros.fecha_hasta || ''}
          onChange={(e) => set('fecha_hasta', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange({ page: 1, limit: 50 })}
        className="rounded border px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
      >
        Limpiar
      </button>
    </div>
  );
}
