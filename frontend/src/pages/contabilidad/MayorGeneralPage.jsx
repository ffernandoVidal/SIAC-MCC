import { useState } from 'react';
import { useMayorGeneralQuery, useExportarMayorGeneral } from '../../hooks/contabilidad/useMayorGeneral';
import MayorFiltros from '../../components/contabilidad/mayor-general/MayorFiltros';
import MayorGeneralTable from '../../components/contabilidad/mayor-general/MayorGeneralTable';
import AuxiliarCuentaModal from '../../components/contabilidad/mayor-general/AuxiliarCuentaModal';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { exportToExcel } from '../../shared/utils/exportExcel';

export default function MayorGeneralPage() {
  const [filtros, setFiltros] = useState({ id_periodo: 1, page: 1, limit: 50 });
  const { data, isLoading } = useMayorGeneralQuery(filtros);
  const { exportar } = useExportarMayorGeneral();
  const [cuentaAuxiliar, setCuentaAuxiliar] = useState(null);

  const handleExportar = async () => {
    const rows = await exportar(filtros);
    exportToExcel(rows, [], 'Mayor_General');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Mayor General</h1>
        <button
          onClick={handleExportar}
          className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Exportar Excel
        </button>
      </div>

      <MayorFiltros filtros={filtros} onChange={setFiltros} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <MayorGeneralTable
          datos={data?.data || []}
          meta={data?.meta}
          onPageChange={(p) => setFiltros({ ...filtros, page: p })}
          onVerAuxiliar={(cuenta) => setCuentaAuxiliar(cuenta)}
        />
      )}

      {cuentaAuxiliar && (
        <AuxiliarCuentaModal
          cuenta={cuentaAuxiliar}
          filtros={filtros}
          onClose={() => setCuentaAuxiliar(null)}
        />
      )}
    </div>
  );
}
