import { useState, useEffect } from 'react';

export default function TercerosDocumentos({ idEmpresa, mostrarToast }) {
  const [tab, setTab] = useState('terceros');
  const [terceros, setTerceros] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [nuevoTercero, setNuevoTercero] = useState({ tipo_tercero: 'CLIENTE', nombre_razon_social: '', identificacion_fiscal: '', telefono: '', correo_electronico: '' });
  const [nuevoDoc, setNuevoDoc] = useState({ id_tipo_documento_fuente: '', numero_documento: '', serie_documento: '', fecha_documento: '', nombre_emisor: '', identificacion_emisor: '', monto_total: '', observaciones: '' });
  const [showFormT, setShowFormT] = useState(false);
  const [showFormD, setShowFormD] = useState(false);

  const cargarTerceros = async () => {
    const res = await fetch(`/api/terceros?id_empresa=${idEmpresa}`);
    const data = await res.json();
    if (data.success) setTerceros(data.data);
  };

  const cargarDocumentos = async () => {
    const res = await fetch(`/api/documentos?id_empresa=${idEmpresa}`);
    const data = await res.json();
    if (data.success) { setDocumentos(data.data); setTiposDoc(data.tipos || []); }
  };

  useEffect(() => { cargarTerceros(); cargarDocumentos(); }, []);

  const guardarTercero = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/terceros', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevoTercero, nombre: nuevoTercero.nombre_razon_social, nit: nuevoTercero.identificacion_fiscal, tipo: nuevoTercero.tipo_tercero, id_empresa: idEmpresa })
    });
    const data = await res.json();
    if (data.success) { mostrarToast('Tercero registrado'); setShowFormT(false); setNuevoTercero({ tipo_tercero: 'CLIENTE', nombre_razon_social: '', identificacion_fiscal: '', telefono: '', correo_electronico: '' }); cargarTerceros(); }
    else mostrarToast(data.error || 'Error', 'danger');
  };

  const guardarDocumento = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/documentos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevoDoc, id_empresa: idEmpresa })
    });
    const data = await res.json();
    if (data.success) { mostrarToast('Documento fuente registrado'); setShowFormD(false); setNuevoDoc({ id_tipo_documento_fuente: '', numero_documento: '', serie_documento: '', fecha_documento: '', nombre_emisor: '', identificacion_emisor: '', monto_total: '', observaciones: '' }); cargarDocumentos(); }
    else mostrarToast(data.error || 'Error', 'danger');
  };

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '';
  const fmtMonto = (m) => m ? `Q ${parseFloat(m).toLocaleString('es-GT', { minimumFractionDigits: 2 })}` : '—';

  const tercerosFiltrados = terceros.filter(t =>
    t.nombre_razon_social?.toLowerCase().includes(buscar.toLowerCase()) ||
    t.identificacion_fiscal?.includes(buscar)
  );

  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      {/* Tabs */}
      <ul className="nav nav-pills mb-3 gap-2">
        <li><button className={`btn rounded-pill fw-bold px-4 ${tab === 'terceros' ? 'btn-primary' : 'btn-light var-text-dark'}`} onClick={() => setTab('terceros')}><i className="bi bi-person-lines-fill me-2"></i>Terceros</button></li>
        <li><button className={`btn rounded-pill fw-bold px-4 ${tab === 'documentos' ? 'btn-primary' : 'btn-light var-text-dark'}`} onClick={() => setTab('documentos')}><i className="bi bi-file-earmark-text me-2"></i>Documentos fuente</button></li>
      </ul>

      {tab === 'terceros' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-bold var-text-dark">Terceros registrados ({terceros.length})</h6>
            </div>
            <div className="d-flex gap-2">
              <div className="input-group" style={{ maxWidth: '220px' }}>
                <span className="input-group-text var-bg-white border-end-0 text-muted border-light-gray rounded-start-pill ps-3"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control border-start-0 ps-1 border-light-gray rounded-end-pill focus-none var-bg-white" placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} />
              </div>
              <button className="btn btn-primary rounded-pill fw-bold px-3" onClick={() => setShowFormT(!showFormT)}>
                <i className={`bi ${showFormT ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>{showFormT ? 'Cancelar' : 'Nuevo'}
              </button>
            </div>
          </div>

          {showFormT && (
            <div className="border-bottom px-4 py-3 var-bg-light-gray">
              <form onSubmit={guardarTercero} className="row g-3">
                <div className="col-md-2">
                  <label className="form-label small fw-medium text-muted">Tipo</label>
                  <select className="form-select" value={nuevoTercero.tipo_tercero} onChange={e => setNuevoTercero({ ...nuevoTercero, tipo_tercero: e.target.value })}>
                    <option value="CLIENTE">Cliente</option><option value="PROVEEDOR">Proveedor</option><option value="EMPLEADO">Empleado</option><option value="BANCO">Banco</option><option value="GENERAL">General</option>
                  </select>
                </div>
                <div className="col-md-3"><label className="form-label small fw-medium text-muted">Nombre / Razón social *</label><input type="text" className="form-control" required value={nuevoTercero.nombre_razon_social} onChange={e => setNuevoTercero({ ...nuevoTercero, nombre_razon_social: e.target.value })} /></div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">NIT</label><input type="text" className="form-control" value={nuevoTercero.identificacion_fiscal} onChange={e => setNuevoTercero({ ...nuevoTercero, identificacion_fiscal: e.target.value })} /></div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">Teléfono</label><input type="text" className="form-control" value={nuevoTercero.telefono} onChange={e => setNuevoTercero({ ...nuevoTercero, telefono: e.target.value })} /></div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">Correo</label><input type="email" className="form-control" value={nuevoTercero.correo_electronico} onChange={e => setNuevoTercero({ ...nuevoTercero, correo_electronico: e.target.value })} /></div>
                <div className="col-md-1 d-flex align-items-end"><button type="submit" className="btn btn-primary rounded-pill w-100"><i className="bi bi-check-lg"></i></button></div>
              </form>
            </div>
          )}

          <div className="card-body p-0 pt-2">
            <div className="table-responsive">
              <table className="table table-hover table-borderless mb-0 align-middle modern-table">
                <thead className="table-light-gray text-muted small text-uppercase">
                  <tr><th className="px-4">ID</th><th>Tipo</th><th>Nombre</th><th>NIT</th><th>Teléfono</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {tercerosFiltrados.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">Sin terceros</td></tr>}
                  {tercerosFiltrados.map(t => (
                    <tr key={t.id_tercero}>
                      <td className="px-4 fw-medium text-muted">{t.id_tercero}</td>
                      <td><span className={`badge rounded-pill ${t.tipo_tercero === 'CLIENTE' ? 'bg-light-success text-success' : t.tipo_tercero === 'PROVEEDOR' ? 'bg-light-warning text-warning' : 'bg-light-info text-info'}`}>{t.tipo_tercero}</span></td>
                      <td className="fw-bold var-text-dark">{t.nombre_razon_social}</td>
                      <td className="text-muted small">{t.identificacion_fiscal || '—'}</td>
                      <td className="text-muted small">{t.telefono || '—'}</td>
                      <td><span className={`badge rounded-pill ${t.estado === 'ACTIVO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{t.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'documentos' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold var-text-dark">Documentos fuente ({documentos.length})</h6>
            <button className="btn btn-primary rounded-pill fw-bold px-3" onClick={() => setShowFormD(!showFormD)}>
              <i className={`bi ${showFormD ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>{showFormD ? 'Cancelar' : 'Nuevo'}
            </button>
          </div>

          {showFormD && (
            <div className="border-bottom px-4 py-3 var-bg-light-gray">
              <form onSubmit={guardarDocumento} className="row g-3">
                <div className="col-md-2">
                  <label className="form-label small fw-medium text-muted">Tipo *</label>
                  <select className="form-select" required value={nuevoDoc.id_tipo_documento_fuente} onChange={e => setNuevoDoc({ ...nuevoDoc, id_tipo_documento_fuente: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {tiposDoc.map(t => <option key={t.id_tipo_documento_fuente} value={t.id_tipo_documento_fuente}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">No. documento *</label><input type="text" className="form-control" required value={nuevoDoc.numero_documento} onChange={e => setNuevoDoc({ ...nuevoDoc, numero_documento: e.target.value })} /></div>
                <div className="col-md-1"><label className="form-label small fw-medium text-muted">Serie</label><input type="text" className="form-control" value={nuevoDoc.serie_documento} onChange={e => setNuevoDoc({ ...nuevoDoc, serie_documento: e.target.value })} /></div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">Fecha *</label><input type="date" className="form-control" required value={nuevoDoc.fecha_documento} onChange={e => setNuevoDoc({ ...nuevoDoc, fecha_documento: e.target.value })} /></div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">Emisor</label><input type="text" className="form-control" value={nuevoDoc.nombre_emisor} onChange={e => setNuevoDoc({ ...nuevoDoc, nombre_emisor: e.target.value })} /></div>
                <div className="col-md-2"><label className="form-label small fw-medium text-muted">Monto Q</label><input type="number" step="0.01" className="form-control" value={nuevoDoc.monto_total} onChange={e => setNuevoDoc({ ...nuevoDoc, monto_total: e.target.value })} /></div>
                <div className="col-md-1 d-flex align-items-end"><button type="submit" className="btn btn-primary rounded-pill w-100"><i className="bi bi-check-lg"></i></button></div>
              </form>
            </div>
          )}

          <div className="card-body p-0 pt-2">
            <div className="table-responsive">
              <table className="table table-hover table-borderless mb-0 align-middle modern-table">
                <thead className="table-light-gray text-muted small text-uppercase">
                  <tr><th className="px-4">No.</th><th>Tipo</th><th>Serie</th><th>Fecha</th><th>Emisor</th><th className="text-end">Monto</th></tr>
                </thead>
                <tbody>
                  {documentos.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">Sin documentos</td></tr>}
                  {documentos.map(d => (
                    <tr key={d.id_documento_fuente}>
                      <td className="px-4 fw-bold var-text-dark">{d.numero_documento}</td>
                      <td><span className="badge bg-light-info text-info rounded-pill">{d.tipo_documento}</span></td>
                      <td className="text-muted small">{d.serie_documento || '—'}</td>
                      <td className="text-muted small">{fmtFecha(d.fecha_documento)}</td>
                      <td className="var-text-dark">{d.nombre_emisor || '—'}</td>
                      <td className="text-end fw-bold">{fmtMonto(d.monto_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
