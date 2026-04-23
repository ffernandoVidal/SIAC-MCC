export default function LibroDiarioFiltros({ filtros, onChange, idEmpresa }) {
  const set = (campo, valor) => onChange({ ...filtros, [campo]: valor, page: 1 });

  // 🔒 CORRECCIÓN: Al limpiar filtros, protegemos el idEmpresa para no romper el sistema
  const limpiarFiltros = () => {
    onChange({ id_empresa: idEmpresa, id_periodo: '', fecha_desde: '', fecha_hasta: '', buscar: '', page: 1, limit: 50 });
  };

  return (
    <div className="row g-3 align-items-end">
      <div className="col-md-3">
        <label className="form-label small fw-medium text-muted mb-1">Fecha Desde</label>
        <input
          type="date"
          className="form-control"
          value={filtros.fecha_desde || ''}
          onChange={(e) => set('fecha_desde', e.target.value)}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label small fw-medium text-muted mb-1">Fecha Hasta</label>
        <input
          type="date"
          className="form-control"
          value={filtros.fecha_hasta || ''}
          onChange={(e) => set('fecha_hasta', e.target.value)}
        />
      </div>
      
      {/* Nuevo campo de búsqueda para nivel Pro */}
      <div className="col-md-4">
        <label className="form-label small fw-medium text-muted mb-1">Buscar (No. Póliza o Cuenta)</label>
        <div className="input-group">
          <span className="input-group-text var-bg-white border-end-0 text-muted border-light-gray rounded-start-pill ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-1 border-light-gray rounded-end-pill focus-none var-bg-white"
            placeholder="Buscar..."
            value={filtros.buscar || ''}
            onChange={(e) => set('buscar', e.target.value)}
          />
        </div>
      </div>

      <div className="col-md-2">
        <button
          type="button"
          onClick={limpiarFiltros}
          className="btn btn-light rounded-pill fw-bold w-100 var-text-dark border-light-gray"
        >
          <i className="bi bi-eraser me-1"></i>Limpiar
        </button>
      </div>
    </div>
  );
}