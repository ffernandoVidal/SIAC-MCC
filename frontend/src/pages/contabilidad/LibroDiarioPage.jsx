import { useState } from 'react';
import { useLibroDiarioQuery, useExportarLibroDiario } from '../../hooks/contabilidad/useLibroDiario';
import LibroDiarioFiltros from '../../components/contabilidad/libro-diario/LibroDiarioFiltros';
import LibroDiarioTable from '../../components/contabilidad/libro-diario/LibroDiarioTable';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { exportToExcel } from '../../shared/utils/exportExcel';

export default function LibroDiarioPage() {
  const [filtros, setFiltros] = useState({ id_periodo: 1, page: 1, limit: 50 });
  const { data, isLoading } = useLibroDiarioQuery(filtros);
  const { exportar } = useExportarLibroDiario();

  const handleExportar = async () => {
    const rows = await exportar(filtros);
    exportToExcel(rows, [], 'Libro_Diario');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Libro Diario</h1>
        <button
          onClick={handleExportar}
          className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Exportar Excel
        </button>
      </div>

      <LibroDiarioFiltros filtros={filtros} onChange={setFiltros} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <LibroDiarioTable
          datos={data?.data || []}
          meta={data?.meta}
          onPageChange={(p) => setFiltros({ ...filtros, page: p })}
        />
      )}
    </div>
  );
}
