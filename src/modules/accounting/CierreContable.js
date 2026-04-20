import { useState, useEffect } from 'react';

export default function CierreContable({ idEmpresa, mostrarToast }) {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioSel, setEjercicioSel] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/ejercicios?id_empresa=${idEmpresa}`);
      const data = await res.json();
      if (data.success) setEjercicios(data.data);
    })();
  }, []);

  const seleccionar = async (ej) => {
    setEjercicioSel(ej);
    const res = await fetch(`/api/periodos?id_ejercicio=${ej.id_ejercicio}`);
    const data = await res.json();
    if (data.success) setPeriodos(data.data);
  };

  const cerrarPeriodo = async (periodo) => {
    if (!confirm(`¿Cerrar el periodo "${periodo.nombre_periodo}"?\n\nEsta acción impedirá registrar nuevas pólizas en este periodo.`)) return;
    setCargando(true);
    try {
      const res = await fetch('/api/periodos', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_periodo: periodo.id_periodo, estado: 'CERRADO' })
      });
      const data = await res.json();
      if (data.success) { mostrarToast(`Periodo "${periodo.nombre_periodo}" cerrado exitosamente`); seleccionar(ejercicioSel); }
      else mostrarToast(data.error || 'Error', 'danger');
    } catch { mostrarToast('Error de conexión', 'danger'); }
    setCargando(false);
  };

  const reabrirPeriodo = async (periodo) => {
    if (!confirm(`¿Reabrir el periodo "${periodo.nombre_periodo}"?`)) return;
    setCargando(true);
    try {
      const res = await fetch('/api/periodos', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_periodo: periodo.id_periodo, estado: 'ABIERTO' })
      });
      const data = await res.json();
      if (data.success) { mostrarToast(`Periodo "${periodo.nombre_periodo}" reabierto`); seleccionar(ejercicioSel); }
      else mostrarToast(data.error || 'Error', 'danger');
    } catch { mostrarToast('Error de conexión', 'danger'); }
    setCargando(false);
  };

  const cerrarEjercicio = async () => {
    const abiertos = periodos.filter(p => p.estado === 'ABIERTO');
    if (abiertos.length > 0) return mostrarToast(`No se puede cerrar. Hay ${abiertos.length} periodos abiertos.`, 'warning');
    if (!confirm(`¿Cerrar el ejercicio fiscal ${ejercicioSel.anio}?\n\nEsta acción cerrará completamente el ejercicio.`)) return;
    setCargando(true);
    try {
      const res = await fetch('/api/ejercicios', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_ejercicio: ejercicioSel.id_ejercicio, estado: 'CERRADO' })
      });
      const data = await res.json();
      if (data.success) {
        mostrarToast(`Ejercicio fiscal ${ejercicioSel.anio} cerrado exitosamente`);
        const resEj = await fetch(`/api/ejercicios?id_empresa=${idEmpresa}`);
        const dataEj = await resEj.json();
        if (dataEj.success) setEjercicios(dataEj.data);
        setEjercicioSel({ ...ejercicioSel, estado: 'CERRADO' });
      }
      else mostrarToast(data.error || 'Error', 'danger');
    } catch { mostrarToast('Error de conexión', 'danger'); }
    setCargando(false);
  };

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '';
  const pAbiertos = periodos.filter(p => p.estado === 'ABIERTO').length;
  const pCerrados = periodos.filter(p => p.estado === 'CERRADO').length;
  const progreso = periodos.length > 0 ? Math.round((pCerrados / periodos.length) * 100) : 0;

  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <div className="row">
        {/* Panel lateral ejercicios */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-light-primary text-primary border-0 rounded-top-4 pt-3 pb-3 px-4">
              <h6 className="mb-0 fw-bold"><i className="bi bi-box-arrow-right me-2"></i>Cierre Contable</h6>
            </div>
            <div className="card-body p-3">
              <p className="text-muted small">Selecciona el ejercicio fiscal para gestionar el cierre de periodos.</p>
            </div>
            <div className="list-group list-group-flush">
              {ejercicios.length === 0 && <div className="list-group-item text-center py-4 text-muted fst-italic">Sin ejercicios fiscales</div>}
              {ejercicios.map(ej => (
                <button key={ej.id_ejercicio} onClick={() => seleccionar(ej)}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${ejercicioSel?.id_ejercicio === ej.id_ejercicio ? 'active' : ''}`}>
                  <div>
                    <strong>Año {ej.anio}</strong><br />
                    <small className={ejercicioSel?.id_ejercicio === ej.id_ejercicio ? 'text-white-50' : 'text-muted'}>{fmtFecha(ej.fecha_inicio)} — {fmtFecha(ej.fecha_fin)}</small>
                  </div>
                  <span className={`badge rounded-pill ${ej.estado === 'ABIERTO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{ej.estado}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel cierre */}
        <div className="col-md-8">
          {!ejercicioSel ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-arrow-left-circle fs-1 d-block mb-3"></i>
              <p>Selecciona un ejercicio fiscal del panel izquierdo</p>
            </div>
          ) : (
            <>
              {/* Progress card */}
              <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold var-text-dark mb-0">Progreso de cierre — Año {ejercicioSel.anio}</h6>
                    <span className={`badge rounded-pill px-3 py-2 ${ejercicioSel.estado === 'CERRADO' ? 'bg-light-danger text-danger' : 'bg-light-success text-success'}`}>
                      Ejercicio {ejercicioSel.estado}
                    </span>
                  </div>
                  <div className="progress rounded-pill mb-2" style={{ height: '24px' }}>
                    <div className="progress-bar bg-primary rounded-pill" style={{ width: `${progreso}%` }}>{progreso}%</div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-unlock me-1"></i>{pAbiertos} abiertos</span>
                    <span><i className="bi bi-lock me-1"></i>{pCerrados} cerrados</span>
                    <span>Total: {periodos.length} periodos</span>
                  </div>

                  {ejercicioSel.estado === 'ABIERTO' && (
                    <div className="mt-3 text-end">
                      <button className="btn btn-danger rounded-pill fw-bold px-4" disabled={cargando || pAbiertos > 0} onClick={cerrarEjercicio}>
                        <i className="bi bi-lock me-2"></i>Cerrar ejercicio completo
                      </button>
                      {pAbiertos > 0 && <p className="text-muted small mt-1">Cierra todos los periodos antes de cerrar el ejercicio.</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Periodos */}
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header var-bg-white border-0 pt-3 pb-2 px-4">
                  <h6 className="fw-bold var-text-dark mb-0"><i className="bi bi-calendar3 me-2"></i>Periodos del ejercicio</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0 align-middle modern-table">
                      <thead className="table-light-gray text-muted small text-uppercase">
                        <tr><th className="px-4">#</th><th>Periodo</th><th>Inicio</th><th>Fin</th><th>Pólizas</th><th>Estado</th><th className="text-center">Acción</th></tr>
                      </thead>
                      <tbody>
                        {periodos.map(p => (
                          <tr key={p.id_periodo}>
                            <td className="px-4 text-muted">{p.numero_periodo}</td>
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
                              {p.estado === 'ABIERTO' ? (
                                <button className="btn btn-sm btn-danger rounded-pill px-3 fw-bold" disabled={cargando} onClick={() => cerrarPeriodo(p)}>
                                  <i className="bi bi-lock me-1"></i>Cerrar
                                </button>
                              ) : (
                                ejercicioSel.estado === 'ABIERTO' && (
                                  <button className="btn btn-sm btn-outline-success rounded-pill px-3" disabled={cargando} onClick={() => reabrirPeriodo(p)}>
                                    <i className="bi bi-unlock me-1"></i>Reabrir
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
