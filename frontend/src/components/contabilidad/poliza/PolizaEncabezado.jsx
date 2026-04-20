import { usePeriodosQuery, useCatalogosPoliza } from '../../../hooks/contabilidad/usePolizas';

export default function PolizaEncabezado({ register, errors, idEjercicio }) {
  const { data: periodos } = usePeriodosQuery(idEjercicio);
  const { data: catalogos } = useCatalogosPoliza();

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Encabezado de póliza</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Periodo */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Periodo *</label>
          <select
            {...register('id_periodo', { required: 'Periodo es requerido', valueAsNumber: true })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {periodos?.map((p) => (
              <option key={p.id_periodo} value={p.id_periodo}>{p.nombre_periodo}</option>
            ))}
          </select>
          {errors.id_periodo && <p className="mt-1 text-xs text-red-500">{errors.id_periodo.message}</p>}
        </div>

        {/* Tipo de póliza */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Tipo de póliza *</label>
          <select
            {...register('id_tipo_poliza', { required: 'Tipo es requerido', valueAsNumber: true })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {catalogos?.tipos?.map((t) => (
              <option key={t.id_tipo_poliza} value={t.id_tipo_poliza}>{t.nombre}</option>
            ))}
          </select>
          {errors.id_tipo_poliza && <p className="mt-1 text-xs text-red-500">{errors.id_tipo_poliza.message}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Fecha *</label>
          <input
            type="date"
            max={hoy}
            {...register('fecha_poliza', { required: 'Fecha es requerida' })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.fecha_poliza && <p className="mt-1 text-xs text-red-500">{errors.fecha_poliza.message}</p>}
        </div>

        {/* Concepto */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Concepto *</label>
          <textarea
            {...register('concepto', { required: 'Concepto es requerido', maxLength: { value: 500, message: 'Máximo 500 caracteres' } })}
            rows={2}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.concepto && <p className="mt-1 text-xs text-red-500">{errors.concepto.message}</p>}
        </div>

        {/* Referencia general */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Referencia general</label>
          <input
            type="text"
            {...register('referencia_general', { maxLength: { value: 150, message: 'Máximo 150 caracteres' } })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.referencia_general && <p className="mt-1 text-xs text-red-500">{errors.referencia_general.message}</p>}
        </div>
      </div>
    </div>
  );
}
