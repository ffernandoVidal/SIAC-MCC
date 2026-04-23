import { useState } from 'react';
import { useLibroDiarioQuery, useExportarLibroDiario } from '../../hooks/contabilidad/useLibroDiario';
import LibroDiarioFiltros from '../../components/contabilidad/libro-diario/LibroDiarioFiltros';
import LibroDiarioTable from '../../components/contabilidad/libro-diario/LibroDiarioTable';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { exportToExcel } from '../../shared/utils/exportExcel';

export default function LibroDiarioPage({ idEmpresa, mostrarToast }) {
  // 🔒 CORRECCIÓN: Quitamos el id_periodo "1" quemado e inyectamos el idEmpresa
  const [filtros, setFiltros] = useState({ id_empresa: idEmpresa, id_periodo: '', page: 1, limit: 50 });
  const { data, isLoading } = useLibroDiarioQuery(filtros);
  const { exportar } = useExportarLibroDiario();

  const handleExportar = async () => {
    try {
      const rows = await exportar(filtros);
      exportToExcel(rows, [], 'Libro_Diario');
      if (mostrarToast) mostrarToast('Exportación exitosa a Excel', 'success');
    } catch (error) {
      if (mostrarToast) mostrarToast('Error al exportar a Excel', 'danger');
    }
  };

  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <div className="card shadow-sm border-0 rounded-4">
        {/* Encabezado estilo SIAC */}
        <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold var-text-dark"><i className="bi bi-book me-2"></i>Libro Diario</h6>
            <p className="text-muted small mb-0">Registro cronológico de movimientos contables</p>
          </div>
          <button
            onClick={handleExportar}
            className="btn btn-outline-success rounded-pill fw-bold px-4"
          >
            <i className="bi bi-file-earmark-excel me-2"></i>Exportar Excel
          </button>
        </div>

        <div className="card-body px-4 py-3">
          {/* Filtros */}
          <div className="border-bottom pb-3 mb-3">
            <LibroDiarioFiltros filtros={filtros} onChange={setFiltros} idEmpresa={idEmpresa} />
          </div>

          {/* Tabla de Pólizas o Spinner de carga */}
          {isLoading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
              <p className="text-muted mt-2 small">Cargando pólizas...</p>
            </div>
          ) : (
            <LibroDiarioTable
              datos={data?.data || []}
              meta={data?.meta}
              onPageChange={(p) => setFiltros({ ...filtros, page: p })}
            />
          )}
        </div>
      </div>
    </div>
  );
}