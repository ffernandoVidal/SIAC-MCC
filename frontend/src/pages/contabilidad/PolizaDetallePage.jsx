import { useParams, useNavigate } from 'react-router-dom';
import { usePolizaQuery, useAprobarPoliza, useAnularPoliza } from '../../hooks/contabilidad/usePolizas';
import PolizaBadgeEstado from '../../components/contabilidad/poliza/PolizaBadgeEstado';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { useState } from 'react';
import ConfirmDialog from '../../shared/components/ConfirmDialog';

export default function PolizaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = usePolizaQuery(id);
  const aprobarMut = useAprobarPoliza();
  const anularMut = useAnularPoliza();
  const [confirmar, setConfirmar] = useState(null);

  if (isLoading) return <LoadingSpinner />;

  const poliza = data?.data;
  if (!poliza) return <p className="text-gray-500">Póliza no encontrada.</p>;

  const ejecutar = () => {
    const promise = confirmar === 'aprobar'
      ? aprobarMut.mutateAsync(id)
      : anularMut.mutateAsync({ id, motivo: 'Anulada por usuario' });
    promise.finally(() => setConfirmar(null));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">Póliza #{poliza.numero_poliza}</h1>
          <PolizaBadgeEstado estado={poliza.estado_poliza} />
        </div>
        <div className="flex gap-2">
          {poliza.estado_poliza === 'BORRADOR' && (
            <>
              <button onClick={() => navigate(`/contabilidad/polizas/${id}/editar`)} className="rounded bg-yellow-500 px-3 py-1.5 text-sm text-white hover:bg-yellow-600">Editar</button>
              <button onClick={() => setConfirmar('aprobar')} className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">Aprobar</button>
            </>
          )}
          {poliza.estado_poliza === 'APROBADA' && (
            <button onClick={() => setConfirmar('anular')} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">Anular</button>
          )}
          <button onClick={() => navigate('/contabilidad/polizas')} className="rounded border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Volver</button>
        </div>
      </div>

      {/* Encabezado */}
      <div className="grid gap-4 rounded-lg border bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div><span className="text-xs text-gray-500">Tipo</span><p className="font-medium">{poliza.tipo_poliza}</p></div>
        <div><span className="text-xs text-gray-500">Fecha</span><p className="font-medium">{formatDate(poliza.fecha_poliza)}</p></div>
        <div><span className="text-xs text-gray-500">Periodo</span><p className="font-medium">{poliza.nombre_periodo}</p></div>
        <div className="sm:col-span-2"><span className="text-xs text-gray-500">Concepto</span><p className="font-medium">{poliza.concepto}</p></div>
        {poliza.referencia_general && <div><span className="text-xs text-gray-500">Referencia</span><p className="font-medium">{poliza.referencia_general}</p></div>}
      </div>

      {/* Renglones */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">#</th>
              <th className="px-4 py-3 text-left text-gray-600">Cuenta</th>
              <th className="px-4 py-3 text-left text-gray-600">Descripción</th>
              <th className="px-4 py-3 text-right text-gray-600">Débito</th>
              <th className="px-4 py-3 text-right text-gray-600">Crédito</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {poliza.renglones?.map((r, i) => (
              <tr key={r.id_renglon || i}>
                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                <td className="px-4 py-2"><span className="font-mono text-xs">{r.codigo_cuenta}</span> {r.nombre_cuenta}</td>
                <td className="px-4 py-2">{r.descripcion_renglon}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(r.monto_debito)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(r.monto_credito)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right">Totales:</td>
              <td className="px-4 py-2 text-right">{formatCurrency(poliza.total_debito)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(poliza.total_credito)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmDialog
        abierto={!!confirmar}
        titulo={confirmar === 'aprobar' ? 'Aprobar póliza' : 'Anular póliza'}
        mensaje={`¿Está seguro de ${confirmar} la póliza #${poliza.numero_poliza}?`}
        onConfirm={ejecutar}
        onCancel={() => setConfirmar(null)}
        cargando={aprobarMut.isPending || anularMut.isPending}
      />
    </div>
  );
}
