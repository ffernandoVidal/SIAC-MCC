import { useState, useEffect } from 'react';

export default function RegistroPolizas({ idEmpresa, mostrarToast }) {
  const [polizas, setPolizas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({ id_periodo: '', id_tipo_poliza: '', id_estado: '' });
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioSel, setEjercicioSel] = useState('');
  const [vista, setVista] = useState('lista'); // lista | detalle | nueva
  const [polizaSel, setPolizaSel] = useState(null);
  const [detalle, setDetalle] = useState(null);
  // Form nueva poliza
  const [form, setForm] = useState({ id_tipo_poliza: '', id_periodo: '', fecha_poliza: '', concepto: '' });
  const [renglones, setRenglones] = useState([{ id_cuenta: '', id_tercero: '', concepto_detalle: '', debito: 0, credito: 0 }]);
  const [cuentas, setCuentas] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const cargarCatalogos = async () => {
    const [resT, resE, resEj] = await Promise.all([
      fetch(`/api/polizas?catalogo=tipos`), fetch(`/api/polizas?catalogo=estados`), fetch(`/api/ejercicios?id_empresa=${idEmpresa}`)
    ]);
    const [dT, dE, dEj] = await Promise.all([resT.json(), resE.json(), resEj.json()]);
    if (dT.success) setTipos(dT.data);
    if (dE.success) setEstados(dE.data);
    if (dEj.success) setEjercicios(dEj.data);
  };

  const cargarPeriodos = async (idEj) => {
    const res = await fetch(`/api/periodos?id_ejercicio=${idEj}`);
    const data = await res.json();
    if (data.success) setPeriodos(data.data);
  };

  const cargarPolizas = async () => {
    const params = new URLSearchParams({ id_empresa: idEmpresa, pagina, limite: 20 });
    if (filtros.id_periodo) params.set('id_periodo', filtros.id_periodo);
    if (filtros.id_tipo_poliza) params.set('id_tipo_poliza', filtros.id_tipo_poliza);
    if (filtros.id_estado) params.set('id_estado', filtros.id_estado);
    const res = await fetch(`/api/polizas?${params}`);
    const data = await res.json();
    if (data.success) { setPolizas(data.data); setTotal(data.total); }
  };

  const cargarDetalle = async (id) => {
    const res = await fetch(`/api/poliza-detalle?id_poliza=${id}`);
    const data = await res.json();
    if (data.success) { setDetalle(data.data); setVista('detalle'); }
  };

  const cargarCuentasTerceros = async () => {
    const [resC, resT] = await Promise.all([
      fetch(`/api/cuentas?id_empresa=${idEmpresa}&solo_movimientos=true`),
      fetch(`/api/terceros?id_empresa=${idEmpresa}`)
    ]);
    const [dC, dT] = await Promise.all([resC.json(), resT.json()]);
    if (dC.success) setCuentas(dC.data);
    if (dT.success) setTerceros(dT.data);
  };

  useEffect(() => { cargarCatalogos(); }, []);
  useEffect(() => { if (ejercicioSel) cargarPeriodos(ejercicioSel); }, [ejercicioSel]);
  useEffect(() => { cargarPolizas(); }, [pagina, filtros]);

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '';
  const fmtMonto = (m) => m ? `Q ${parseFloat(m).toLocaleString('es-GT', { minimumFractionDigits: 2 })}` : 'Q 0.00';

  const addRenglon = () => setRenglones([...renglones, { id_cuenta: '', id_tercero: '', concepto_detalle: '', debito: 0, credito: 0 }]);
  const removeRenglon = (idx) => { if (renglones.length > 1) setRenglones(renglones.filter((_, i) => i !== idx)); };
  const updateRenglon = (idx, campo, valor) => {
    const copia = [...renglones];
    copia[idx] = { ...copia[idx], [campo]: valor };
    setRenglones(copia);
  };

  const totalDebe = renglones.reduce((s, r) => s + (parseFloat(r.debito) || 0), 0);
  const totalHaber = renglones.reduce((s, r) => s + (parseFloat(r.credito) || 0), 0);
  const cuadra = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;

  const abrirNueva = () => {
    cargarCuentasTerceros();
    setForm({ id_tipo_poliza: tipos[0]?.id_tipo_poliza || '', id_periodo: '', fecha_poliza: new Date().toISOString().split('T')[0], concepto: '' });
    setRenglones([{ id_cuenta: '', id_tercero: '', concepto_detalle: '', debito: 0, credito: 0 }]);
    setVista('nueva');
  };

  const guardarPoliza = async (e) => {
    e.preventDefault();
    if (!cuadra) return mostrarToast('La póliza no cuadra. Debe = Haber', 'danger');
    setGuardando(true);
    try {
      const body = {
        ...form, id_empresa: idEmpresa, id_usuario: parseInt(localStorage.getItem('userId') || '1'),
        renglones: renglones.map((r, i) => ({ ...r, numero_linea: i + 1, debito: parseFloat(r.debito) || 0, credito: parseFloat(r.credito) || 0 }))
      };
      const res = await fetch('/api/polizas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { mostrarToast('Póliza registrada correctamente'); setVista('lista'); cargarPolizas(); }
      else mostrarToast(data.error || 'Error al guardar', 'danger');
    } catch { mostrarToast('Error de conexión', 'danger'); }
    setGuardando(false);
  };

  const cambiarEstado = async (idPoliza, nuevoEstado) => {
    const res = await fetch('/api/polizas', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_poliza: idPoliza, id_estado: nuevoEstado })
    });
    const data = await res.json();
    if (data.success) { mostrarToast('Estado actualizado'); cargarPolizas(); }
    else mostrarToast(data.error || 'Error', 'danger');
  };

  const totalPaginas = Math.ceil(total / 20);

  // ===== Vista DETALLE =====
  if (vista === 'detalle' && detalle) return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <button className="btn btn-light rounded-pill fw-bold mb-3" onClick={() => setVista('lista')}><i className="bi bi-arrow-left me-2"></i>Volver a la lista</button>
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header var-bg-white border-0 pt-4 px-4 d-flex justify-content-between">
          <div>
            <h6 className="fw-bold var-text-dark"><i className="bi bi-receipt me-2"></i>Póliza #{detalle.numero_poliza}</h6>
            <p className="text-muted small mb-0">{detalle.tipo_poliza} — {detalle.nombre_periodo} — {fmtFecha(detalle.fecha_poliza)}</p>
          </div>
          <span className={`badge rounded-pill h-auto px-3 ${detalle.estado === 'APROBADA' ? 'bg-light-success text-success' : detalle.estado === 'BORRADOR' ? 'bg-light-warning text-warning' : 'bg-light-info text-info'}`}>{detalle.estado}</span>
        </div>
        <div className="card-body px-4">
          <p className="var-text-dark"><strong>Concepto:</strong> {detalle.concepto}</p>
          <p className="text-muted small"><strong>Creada:</strong> {fmtFecha(detalle.fecha_creacion)} por {detalle.usuario_creo}</p>
          <div className="table-responsive mt-3">
            <table className="table table-borderless table-hover mb-0 align-middle modern-table">
              <thead className="table-light-gray text-muted small text-uppercase">
                <tr><th className="px-4">#</th><th>Cuenta</th><th>Tercero</th><th>Concepto</th><th className="text-end">Debe</th><th className="text-end">Haber</th></tr>
              </thead>
              <tbody>
                {(detalle.renglones || []).map(r => (
                  <tr key={r.id_detalle_poliza}>
                    <td className="px-4 text-muted">{r.numero_linea}</td>
                    <td><code className="text-primary">{r.codigo_cuenta}</code> <span className="ms-1 var-text-dark small">{r.nombre_cuenta}</span></td>
                    <td className="text-muted small">{r.nombre_tercero || '—'}</td>
                    <td className="text-muted small">{r.concepto_detalle || '—'}</td>
                    <td className="text-end fw-bold">{parseFloat(r.debito) > 0 ? fmtMonto(r.debito) : ''}</td>
                    <td className="text-end fw-bold">{parseFloat(r.credito) > 0 ? fmtMonto(r.credito) : ''}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-top">
                <tr className="fw-bold">
                  <td colSpan="4" className="text-end px-4">Totales:</td>
                  <td className="text-end text-success">{fmtMonto(detalle.total_debe)}</td>
                  <td className="text-end text-danger">{fmtMonto(detalle.total_haber)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== Vista NUEVA =====
  if (vista === 'nueva') return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <button className="btn btn-light rounded-pill fw-bold mb-3" onClick={() => setVista('lista')}><i className="bi bi-arrow-left me-2"></i>Cancelar</button>
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-light-primary text-primary border-0 rounded-top-4 pt-3 pb-3 px-4">
          <h6 className="mb-0 fw-bold"><i className="bi bi-plus-circle me-2"></i>Nueva Póliza Contable</h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={guardarPoliza}>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label small fw-medium text-muted">Tipo de póliza *</label>
                <select className="form-select" required value={form.id_tipo_poliza} onChange={e => setForm({ ...form, id_tipo_poliza: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {tipos.map(t => <option key={t.id_tipo_poliza} value={t.id_tipo_poliza}>{t.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-medium text-muted">Ejercicio *</label>
                <select className="form-select" required value={ejercicioSel} onChange={e => setEjercicioSel(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {ejercicios.map(ej => <option key={ej.id_ejercicio} value={ej.id_ejercicio}>{ej.anio}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-medium text-muted">Periodo *</label>
                <select className="form-select" required value={form.id_periodo} onChange={e => setForm({ ...form, id_periodo: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {periodos.filter(p => p.estado === 'ABIERTO').map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre_periodo}</option>)}
                </select>
              </div>
              <div className="col-md-2"><label className="form-label small fw-medium text-muted">Fecha *</label><input type="date" className="form-control" required value={form.fecha_poliza} onChange={e => setForm({ ...form, fecha_poliza: e.target.value })} /></div>
              <div className="col-md-4 mt-3"><label className="form-label small fw-medium text-muted">Concepto *</label><input type="text" className="form-control" required value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} placeholder="Descripción de la póliza" /></div>
            </div>

            {/* Renglones de detalle */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold var-text-dark mb-0">Detalle de la póliza</h6>
              <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={addRenglon}><i className="bi bi-plus me-1"></i>Agregar línea</button>
            </div>
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0">
                <thead className="table-light-gray text-muted small text-uppercase">
                  <tr><th>#</th><th>Cuenta *</th><th>Tercero</th><th>Concepto</th><th style={{ width: '130px' }}>Debe</th><th style={{ width: '130px' }}>Haber</th><th></th></tr>
                </thead>
                <tbody>
                  {renglones.map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <select className="form-select form-select-sm" required value={r.id_cuenta} onChange={e => updateRenglon(idx, 'id_cuenta', e.target.value)}>
                          <option value="">Seleccionar cuenta</option>
                          {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.codigo_cuenta} - {c.nombre_cuenta}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="form-select form-select-sm" value={r.id_tercero} onChange={e => updateRenglon(idx, 'id_tercero', e.target.value)}>
                          <option value="">Ninguno</option>
                          {terceros.map(t => <option key={t.id_tercero} value={t.id_tercero}>{t.nombre_razon_social}</option>)}
                        </select>
                      </td>
                      <td><input type="text" className="form-control form-control-sm" value={r.concepto_detalle} onChange={e => updateRenglon(idx, 'concepto_detalle', e.target.value)} /></td>
                      <td><input type="number" step="0.01" min="0" className="form-control form-control-sm text-end" value={r.debito} onChange={e => updateRenglon(idx, 'debito', e.target.value)} /></td>
                      <td><input type="number" step="0.01" min="0" className="form-control form-control-sm text-end" value={r.credito} onChange={e => updateRenglon(idx, 'credito', e.target.value)} /></td>
                      <td><button type="button" className="btn btn-sm text-danger action-btn" onClick={() => removeRenglon(idx)}><i className="bi bi-trash"></i></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-top">
                  <tr className="fw-bold">
                    <td colSpan="4" className="text-end">Totales:</td>
                    <td className="text-end text-success">{fmtMonto(totalDebe)}</td>
                    <td className="text-end text-danger">{fmtMonto(totalHaber)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {!cuadra && totalDebe > 0 && (
              <div className="alert alert-danger rounded-3 py-2 mt-2"><i className="bi bi-exclamation-triangle me-2"></i>La póliza no cuadra. Diferencia: {fmtMonto(Math.abs(totalDebe - totalHaber))}</div>
            )}
            <div className="text-end mt-3">
              <button type="submit" className="btn btn-primary rounded-pill fw-bold px-4" disabled={guardando || !cuadra}>
                {guardando ? 'Guardando...' : 'Registrar Póliza'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // ===== Vista LISTA =====
  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h6 className="mb-0 fw-bold var-text-dark"><i className="bi bi-receipt me-2"></i>Registro de Pólizas</h6>
            <p className="text-muted small mb-0">{total} pólizas registradas</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <select className="form-select form-select-sm rounded-pill" style={{ maxWidth: '140px' }} value={filtros.id_tipo_poliza} onChange={e => setFiltros({ ...filtros, id_tipo_poliza: e.target.value })}>
              <option value="">Todos los tipos</option>
              {tipos.map(t => <option key={t.id_tipo_poliza} value={t.id_tipo_poliza}>{t.nombre}</option>)}
            </select>
            <select className="form-select form-select-sm rounded-pill" style={{ maxWidth: '130px' }} value={filtros.id_estado} onChange={e => setFiltros({ ...filtros, id_estado: e.target.value })}>
              <option value="">Todos estados</option>
              {estados.map(e => <option key={e.id_estado_poliza} value={e.id_estado_poliza}>{e.nombre}</option>)}
            </select>
            <button className="btn btn-primary rounded-pill fw-bold px-3" onClick={abrirNueva}>
              <i className="bi bi-plus-lg me-1"></i>Nueva póliza
            </button>
          </div>
        </div>
        <div className="card-body p-0 pt-2">
          <div className="table-responsive">
            <table className="table table-hover table-borderless mb-0 align-middle modern-table">
              <thead className="table-light-gray text-muted small text-uppercase">
                <tr><th className="px-4">No.</th><th>Fecha</th><th>Tipo</th><th>Periodo</th><th>Concepto</th><th className="text-end">Debe</th><th className="text-end">Haber</th><th>Estado</th><th className="text-center">Acción</th></tr>
              </thead>
              <tbody>
                {polizas.length === 0 && <tr><td colSpan="9" className="text-center py-5 text-muted fst-italic"><i className="bi bi-receipt fs-2 d-block mb-2"></i>Sin pólizas registradas</td></tr>}
                {polizas.map(p => (
                  <tr key={p.id_poliza} className="transition-hover cursor-pointer" onClick={() => cargarDetalle(p.id_poliza)}>
                    <td className="px-4 fw-bold text-primary">{p.numero_poliza}</td>
                    <td className="text-muted small">{fmtFecha(p.fecha_poliza)}</td>
                    <td><span className="badge bg-light-primary text-primary rounded-pill">{p.tipo_poliza}</span></td>
                    <td className="text-muted small">{p.nombre_periodo}</td>
                    <td className="var-text-dark" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.concepto}</td>
                    <td className="text-end fw-medium">{fmtMonto(p.total_debe)}</td>
                    <td className="text-end fw-medium">{fmtMonto(p.total_haber)}</td>
                    <td>
                      <span className={`badge rounded-pill ${p.estado === 'APROBADA' ? 'bg-light-success text-success' : p.estado === 'BORRADOR' ? 'bg-light-warning text-warning' : p.estado === 'CANCELADA' ? 'bg-light-danger text-danger' : 'bg-light-info text-info'}`}>{p.estado}</span>
                    </td>
                    <td className="text-center" onClick={e => e.stopPropagation()}>
                      {p.estado === 'BORRADOR' && (
                        <button className="btn btn-sm btn-outline-success rounded-pill px-2 me-1" title="Aprobar" onClick={() => { const aprobada = estados.find(e => e.nombre === 'APROBADA'); if (aprobada) cambiarEstado(p.id_poliza, aprobada.id_estado_poliza); }}>
                          <i className="bi bi-check2-circle"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPaginas > 1 && (
            <nav className="d-flex justify-content-center py-3">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}><button className="page-link rounded-start-pill" onClick={() => setPagina(pagina - 1)}>‹</button></li>
                {[...Array(Math.min(totalPaginas, 5))].map((_, i) => (
                  <li key={i} className={`page-item ${pagina === i + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => setPagina(i + 1)}>{i + 1}</button></li>
                ))}
                <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}><button className="page-link rounded-end-pill" onClick={() => setPagina(pagina + 1)}>›</button></li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
