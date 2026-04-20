import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolizasQuery, useAprobarPoliza, useAnularPoliza } from '../../hooks/contabilidad/usePolizas';
import PolizaFiltros from '../../components/contabilidad/poliza/PolizaFiltros';
import PolizaTable from '../../components/contabilidad/poliza/PolizaTable';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

export default function PolizasPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ id_periodo: '', page: 1, limit: 20 });
  const { data, isLoading } = usePolizasQuery(filtros);

  const aprobarMut = useAprobarPoliza();
  const anularMut = useAnularPoliza();

  const [confirmar, setConfirmar] = useState(null); // { tipo, poliza }

  const handleAprobar = (poliza) => setConfirmar({ tipo: 'aprobar', poliza });
  const handleAnular = (poliza) => setConfirmar({ tipo: 'anular', poliza });

  const ejecutarAccion = () => {
    if (!confirmar) return;
    const { tipo, poliza } = confirmar;
    const promise = tipo === 'aprobar'
      ? aprobarMut.mutateAsync(poliza.id_poliza)
      : anularMut.mutateAsync({ id: poliza.id_poliza, motivo: 'Anulada por usuario' });

    promise.finally(() => setConfirmar(null));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Pólizas</h1>
        <button
          onClick={() => navigate('/contabilidad/polizas/nueva')}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Nueva póliza
        </button>
      </div>

      <PolizaFiltros filtros={filtros} onChange={setFiltros} idEjercicio={1} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <PolizaTable
          datos={data?.data || []}
          meta={data?.meta}
          onPageChange={(p) => setFiltros({ ...filtros, page: p })}
          onAprobar={handleAprobar}
          onAnular={handleAnular}
        />
      )}

      <ConfirmDialog
        abierto={!!confirmar}
        titulo={confirmar?.tipo === 'aprobar' ? 'Aprobar póliza' : 'Anular póliza'}
        mensaje={`¿Está seguro de ${confirmar?.tipo} la póliza #${confirmar?.poliza?.numero_poliza}?`}
        onConfirm={ejecutarAccion}
        onCancel={() => setConfirmar(null)}
        cargando={aprobarMut.isPending || anularMut.isPending}
      />
    </div>
  );
}
