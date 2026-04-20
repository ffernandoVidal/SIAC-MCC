import { usePeriodosQuery, useCatalogosPoliza } from '../../../hooks/contabilidad/usePolizas';

export default function PolizaFiltros({ filtros, onChange, idEjercicio }) {
  const { data: periodos } = usePeriodosQuery(idEjercicio);
  const { data: catalogos } = useCatalogosPoliza();

  const set = (campo, valor) => onChange({ ...filtros, [campo]: valor, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Periodo */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Periodo *</label>
        <select
          value={filtros.id_periodo || ''}
          onChange={(e) => set('id_periodo', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Seleccionar...</option>
          {periodos?.map((p) => (
            <option key={p.id_periodo} value={p.id_periodo}>{p.nombre_periodo}</option>
          ))}
        </select>
      </div>

      {/* Tipo póliza */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Tipo</label>
        <select
          value={filtros.id_tipo_poliza || ''}
          onChange={(e) => set('id_tipo_poliza', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {catalogos?.tipos?.map((t) => (
            <option key={t.id_tipo_poliza} value={t.id_tipo_poliza}>{t.nombre}</option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Estado</label>
        <select
          value={filtros.estado || ''}
          onChange={(e) => set('estado', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {catalogos?.estados?.map((e) => (
            <option key={e.id_estado_poliza} value={e.codigo}>{e.nombre}</option>
          ))}
        </select>
      </div>

      {/* Fecha desde */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Desde</label>
        <input
          type="date"
          value={filtros.fecha_desde || ''}
          onChange={(e) => set('fecha_desde', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Fecha hasta */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Hasta</label>
        <input
          type="date"
          value={filtros.fecha_hasta || ''}
          onChange={(e) => set('fecha_hasta', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Limpiar */}
      <button
        type="button"
        onClick={() => onChange({ id_periodo: filtros.id_periodo, page: 1, limit: 20 })}
        className="rounded border px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
      >
        Limpiar
      </button>
    </div>
  );
}
