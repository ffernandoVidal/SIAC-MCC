import { useState, useEffect } from 'react';

export default function EjercicioFiscal({ idEmpresa, mostrarToast }) {
  const [ejercicios, setEjercicios] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [ejercicioSel, setEjercicioSel] = useState(null);
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
  const [creando, setCreando] = useState(false);

  const cargarEjercicios = async () => {
    const res = await fetch(`/api/ejercicios?id_empresa=${idEmpresa}`);
    const data = await res.json();
    if (data.success) setEjercicios(data.data);
  };

  const cargarPeriodos = async (idEj) => {
    const res = await fetch(`/api/periodos?id_ejercicio=${idEj}`);
    const data = await res.json();
    if (data.success) setPeriodos(data.data);
  };

  useEffect(() => { cargarEjercicios(); }, []);

  const seleccionarEjercicio = (ej) => {
    setEjercicioSel(ej);
    cargarPeriodos(ej.id_ejercicio);
  };

  const crearEjercicio = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      const res = await fetch('/api/ejercicios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_empresa: idEmpresa, anio: nuevoAnio, fecha_inicio: `${nuevoAnio}-01-01`, fecha_fin: `${nuevoAnio}-12-31` })
      });
      const data = await res.json();
      if (data.success) { mostrarToast('Ejercicio fiscal creado con 12 periodos'); cargarEjercicios(); setNuevoAnio(nuevoAnio + 1); }
      else mostrarToast('Error: ' + data.error, 'danger');
    } catch { mostrarToast('Error de conexión', 'danger'); }
    setCreando(false);
  };

  const togglePeriodo = async (periodo) => {
    const nuevoEstado = periodo.estado === 'ABIERTO' ? 'CERRADO' : 'ABIERTO';
    if (!confirm(`¿${nuevoEstado === 'CERRADO' ? 'Cerrar' : 'Reabrir'} periodo "${periodo.nombre_periodo}"?`)) return;
    await fetch('/api/periodos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_periodo: periodo.id_periodo, estado: nuevoEstado })
    });
    mostrarToast(`Periodo ${nuevoEstado === 'CERRADO' ? 'cerrado' : 'reabierto'}`);
    cargarPeriodos(ejercicioSel.id_ejercicio);
  };

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '';

  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <div className="row">
        {/* Panel crear ejercicio */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-light-primary text-primary border-0 rounded-top-4 pt-3 pb-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-calendar-plus me-2"></i>Nuevo Ejercicio Fiscal</h6>
            </div>
            <div className="card-body p-4">
              <form onSubmit={crearEjercicio}>
                <div className="mb-3">
                  <label className="form-label small fw-medium text-muted">Año fiscal</label>
                  <input type="number" min="2020" max="2030" className="form-control" value={nuevoAnio} onChange={(e) => setNuevoAnio(parseInt(e.target.value))} required />
                </div>
                <p className="text-muted small mb-3"><i className="bi bi-info-circle me-1"></i>Se generarán automáticamente 12 periodos mensuales.</p>
                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold" disabled={creando}>
                  {creando ? 'Creando...' : 'Crear Ejercicio'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de ejercicios */}
          <div className="card shadow-sm border-0 rounded-4 mt-3">
            <div className="card-header var-bg-white border-0 pt-3 pb-2 px-4">
              <h6 className="fw-bold mb-0 var-text-dark"><i className="bi bi-list-ul me-2"></i>Ejercicios ({ejercicios.length})</h6>
            </div>
            <div className="list-group list-group-flush">
              {ejercicios.length === 0 && <div className="list-group-item text-muted text-center py-4 fst-italic">Sin ejercicios fiscales</div>}
              {ejercicios.map(ej => (
                <button key={ej.id_ejercicio} onClick={() => seleccionarEjercicio(ej)}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${ejercicioSel?.id_ejercicio === ej.id_ejercicio ? 'active' : ''}`}>
                  <div>
                    <strong className="d-block">Año {ej.anio}</strong>
                    <small className={ejercicioSel?.id_ejercicio === ej.id_ejercicio ? 'text-white-50' : 'text-muted'}>{fmtFecha(ej.fecha_inicio)} — {fmtFecha(ej.fecha_fin)}</small>
                  </div>
                  <div className="text-end">
                    <span className={`badge rounded-pill ${ej.estado === 'ABIERTO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{ej.estado}</span>
                    <small className={`d-block mt-1 ${ejercicioSel?.id_ejercicio === ej.id_ejercicio ? 'text-white-50' : 'text-muted'}`}>{ej.total_periodos} periodos</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de periodos */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0 fw-bold var-text-dark"><i className="bi bi-calendar3 me-2"></i>Periodos Contables</h6>
                <p className="text-muted small mb-0">{ejercicioSel ? `Ejercicio ${ejercicioSel.anio}` : 'Selecciona un ejercicio'}</p>
              </div>
              {ejercicioSel && (
                <span className="badge bg-light-primary text-primary rounded-pill px-3 py-2">
                  {periodos.filter(p => p.estado === 'ABIERTO').length} abiertos / {periodos.length} total
                </span>
              )}
            </div>
            <div className="card-body p-0 pt-2">
              <div className="table-responsive">
                <table className="table table-hover table-borderless mb-0 align-middle modern-table">
                  <thead className="table-light-gray text-muted small text-uppercase">
                    <tr>
                      <th className="px-4">#</th>
                      <th>Periodo</th>
                      <th>Fecha inicio</th>
                      <th>Fecha fin</th>
                      <th>Pólizas</th>
                      <th>Estado</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!ejercicioSel && (
                      <tr><td colSpan="7" className="text-center py-5 text-muted fst-italic">
                        <i className="bi bi-arrow-left-circle fs-2 d-block mb-2"></i>Selecciona un ejercicio fiscal del panel izquierdo
                      </td></tr>
                    )}
                    {ejercicioSel && periodos.length === 0 && (
                      <tr><td colSpan="7" className="text-center py-5 text-muted fst-italic">Sin periodos</td></tr>
                    )}
                    {periodos.map(p => (
                      <tr key={p.id_periodo} className="transition-hover">
                        <td className="px-4 fw-medium text-muted">{p.numero_periodo}</td>
                        <td className="fw-bold var-text-dark">{p.nombre_periodo}</td>
                        <td className="text-muted small">{fmtFecha(p.fecha_inicio)}</td>
                        <td className="text-muted small">{fmtFecha(p.fecha_fin)}</td>
                        <td><span className="badge bg-light-info text-info rounded-pill">{p.total_polizas || 0}</span></td>
                        <td>
                          <span className={`badge rounded-pill ${p.estado === 'ABIERTO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>
                            <i className={`bi ${p.estado === 'ABIERTO' ? 'bi-unlock' : 'bi-lock'} me-1`}></i>{p.estado}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className={`btn btn-sm rounded-pill px-3 ${p.estado === 'ABIERTO' ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => togglePeriodo(p)}>
                            {p.estado === 'ABIERTO' ? 'Cerrar' : 'Reabrir'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
