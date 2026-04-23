export default function LibroDiarioTable({ datos, meta, onPageChange }) {
  const totalPages = meta?.total ? Math.ceil(meta.total / (meta.limit || 50)) : 1;
  const currentPage = meta?.page || 1;

  // Formateadores nativos para asegurar Quetzales (GTQ) y fechas de Guatemala
  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '';
  const fmtMonto = (m) => {
    const num = parseFloat(m);
    if (!num || num === 0) return ''; // Dejamos en blanco si es 0 para limpiar la vista
    return `Q ${num.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-hover table-borderless mb-0 align-middle modern-table">
          <thead className="table-light-gray text-muted small text-uppercase">
            <tr>
              <th className="px-4">Fecha</th>
              <th>Tipo</th>
              <th>No. Póliza</th>
              <th>Cuenta</th>
              <th>Nombre cuenta</th>
              <th>Descripción</th>
              <th className="text-end">Débito</th>
              <th className="text-end px-4">Crédito</th>
            </tr>
          </thead>
          <tbody>
            {datos && datos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted fst-italic">
                  <i className="bi bi-journal-x fs-2 d-block mb-2"></i>
                  No hay movimientos en el rango seleccionado
                </td>
              </tr>
            ) : (
              datos?.map((fila, index) => (
                <tr key={index} className="transition-hover border-bottom border-light">
                  <td className="px-4 text-muted small">{fmtFecha(fila.fecha_poliza)}</td>
                  <td><span className="badge bg-light-info text-info rounded-pill">{fila.tipo_poliza}</span></td>
                  <td className="fw-bold var-text-dark">{fila.numero_poliza}</td>
                  <td><code className="text-primary fw-bold">{fila.codigo_cuenta}</code></td>
                  <td className="fw-medium var-text-dark">{fila.nombre_cuenta}</td>
                  <td className="text-muted small">{fila.descripcion_renglon}</td>
                  <td className="text-end fw-bold text-success">{fmtMonto(fila.monto_debito)}</td>
                  <td className="text-end fw-bold text-danger px-4">{fmtMonto(fila.monto_credito)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación Bootstrap */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-4 pt-3 border-top">
          <span className="text-muted small">
            Mostrando página {currentPage} de {totalPages} ({meta?.total || 0} registros)
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0 gap-2">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="btn btn-outline-secondary rounded-pill px-3 btn-sm" onClick={() => onPageChange(currentPage - 1)}>
                  <i className="bi bi-chevron-left me-1"></i>Anterior
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="btn btn-outline-primary rounded-pill px-3 btn-sm" onClick={() => onPageChange(currentPage + 1)}>
                  Siguiente<i className="bi bi-chevron-right ms-1"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}