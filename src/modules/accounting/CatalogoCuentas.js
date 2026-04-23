import { useState, useEffect } from 'react';

export default function CatalogoCuentas({ idEmpresa, mostrarToast }) {
  const [cuentas, setCuentas] = useState([]);
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nueva, setNueva] = useState({ codigo_cuenta: '', nombre_cuenta: '', id_tipo_cuenta: '', id_cuenta_padre: '', nivel: 1, naturaleza: 'DEUDORA', acepta_movimientos: true, requiere_tercero: false, descripcion: '' });
  const [editando, setEditando] = useState(null);

  const cargarCuentas = async () => {
    const res = await fetch(`/api/cuentas?id_empresa=${idEmpresa}&buscar=${buscar}`);
    const data = await res.json();
    if (data.success) setCuentas(data.data);
  };

  const cargarTipos = async () => {
    const res = await fetch('/api/tipos-cuenta');
    const data = await res.json();
    if (data.success) setTiposCuenta(data.data);
  };

  useEffect(() => { cargarTipos(); }, []);
  useEffect(() => { cargarCuentas(); }, [buscar]);

  const guardar = async (e) => {
    e.preventDefault();

    // 🔒 NUEVO CANDADO: Validación de Naturaleza vs Cuenta Padre
    if (nueva.id_cuenta_padre) {
      const cuentaPadreSeleccionada = cuentas.find(c => c.id_cuenta.toString() === nueva.id_cuenta_padre.toString());
      if (cuentaPadreSeleccionada && cuentaPadreSeleccionada.naturaleza !== nueva.naturaleza) {
        mostrarToast(`Error: La naturaleza debe ser ${cuentaPadreSeleccionada.naturaleza} igual que su cuenta padre.`, 'danger');
        return; // Detenemos el guardado
      }
    }

    try {
      const res = await fetch('/api/cuentas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nueva, id_empresa: idEmpresa })
      });
      const data = await res.json();
      if (data.success) { 
        mostrarToast('Cuenta creada'); 
        setMostrarForm(false); 
        setNueva({ codigo_cuenta: '', nombre_cuenta: '', id_tipo_cuenta: '', id_cuenta_padre: '', nivel: 1, naturaleza: 'DEUDORA', acepta_movimientos: true, requiere_tercero: false, descripcion: '' }); 
        cargarCuentas(); 
      }
      else mostrarToast('Error: ' + data.error, 'danger');
    } catch { mostrarToast('Error de conexión', 'danger'); }
  };

  const toggleEstado = async (cuenta) => {
    const nuevoEstado = cuenta.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    if (!confirm(`¿${nuevoEstado === 'INACTIVA' ? 'Desactivar' : 'Activar'} cuenta ${cuenta.codigo_cuenta}?`)) return;
    await fetch('/api/cuentas', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_cuenta: cuenta.id_cuenta, estado: nuevoEstado })
    });
    mostrarToast('Estado actualizado');
    cargarCuentas();
  };

  const cuentasPadre = cuentas.filter(c => !c.acepta_movimientos);
  const indentStyle = (nivel) => ({ paddingLeft: `${(nivel - 1) * 20 + 16}px` });

  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold var-text-dark"><i className="bi bi-tree me-2"></i>Catálogo de Cuentas Contables</h6>
            <p className="text-muted small mb-0">{cuentas.length} cuentas registradas</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group" style={{ maxWidth: '250px' }}>
              <span className="input-group-text var-bg-white border-end-0 text-muted border-light-gray rounded-start-pill ps-3"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control border-start-0 ps-1 border-light-gray rounded-end-pill focus-none var-bg-white" placeholder="Buscar cuenta..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
            <button className="btn btn-primary rounded-pill fw-bold px-3" onClick={() => setMostrarForm(!mostrarForm)}>
              <i className={`bi ${mostrarForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>{mostrarForm ? 'Cancelar' : 'Nueva cuenta'}
            </button>
          </div>
        </div>

        {/* Form nueva cuenta */}
        {mostrarForm && (
          <div className="border-bottom px-4 py-3 var-bg-light-gray">
            <form onSubmit={guardar}>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label small fw-medium text-muted">Código *</label>
                  <input type="text" className="form-control" value={nueva.codigo_cuenta} onChange={e => setNueva({ ...nueva, codigo_cuenta: e.target.value.replace(/[^0-9.]/g, '') })} required placeholder="Ej: 1.1.01" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium text-muted">Nombre *</label>
                  <input type="text" className="form-control" value={nueva.nombre_cuenta} onChange={e => setNueva({ ...nueva, nombre_cuenta: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-medium text-muted">Tipo cuenta *</label>
                  <select className="form-select" value={nueva.id_tipo_cuenta} onChange={e => setNueva({ ...nueva, id_tipo_cuenta: e.target.value })} required>
                    <option value="">Seleccionar</option>
                    {tiposCuenta.map(t => <option key={t.id_tipo_cuenta} value={t.id_tipo_cuenta}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-medium text-muted">Cuenta padre</label>
                  <select className="form-select" value={nueva.id_cuenta_padre} onChange={e => setNueva({ ...nueva, id_cuenta_padre: e.target.value })}>
                    <option value="">Ninguna (raíz)</option>
                    {cuentasPadre.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.codigo_cuenta} - {c.nombre_cuenta}</option>)}
                  </select>
                </div>
                <div className="col-md-1">
                  <label className="form-label small fw-medium text-muted">Nivel</label>
                  <input type="number" min="1" max="8" className="form-control" value={nueva.nivel} onChange={e => setNueva({ ...nueva, nivel: parseInt(e.target.value) })} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-medium text-muted">Naturaleza *</label>
                  <select className="form-select" value={nueva.naturaleza} onChange={e => setNueva({ ...nueva, naturaleza: e.target.value })}>
                    <option value="DEUDORA">Deudora</option>
                    <option value="ACREEDORA">Acreedora</option>
                  </select>
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-md-4">
                  <label className="form-label small fw-medium text-muted">Descripción</label>
                  <input type="text" className="form-control" value={nueva.descripcion} onChange={e => setNueva({ ...nueva, descripcion: e.target.value })} />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={nueva.acepta_movimientos} onChange={e => setNueva({ ...nueva, acepta_movimientos: e.target.checked })} id="chk_mov" />
                    <label className="form-check-label small fw-medium" htmlFor="chk_mov">Acepta movimientos</label>
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={nueva.requiere_tercero} onChange={e => setNueva({ ...nueva, requiere_tercero: e.target.checked })} id="chk_ter" />
                    <label className="form-check-label small fw-medium" htmlFor="chk_ter">Requiere tercero</label>
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-end justify-content-end">
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold px-4">
                    <i className="bi bi-check-lg me-1"></i>Guardar cuenta
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="card-body p-0 pt-2">
          <div className="table-responsive">
            <table className="table table-hover table-borderless mb-0 align-middle modern-table">
              <thead className="table-light-gray text-muted small text-uppercase">
                <tr>
                  <th className="px-4">Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Naturaleza</th>
                  <th className="text-center">Movimientos</th>
                  <th className="text-center">Tercero</th>
                  <th>Estado</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.length === 0 && (
                  <tr><td colSpan="8" className="text-center py-5 text-muted fst-italic">
                    <i className="bi bi-tree fs-2 d-block mb-2"></i>{buscar ? 'Sin coincidencias' : 'Agrega la primera cuenta'}
                  </td></tr>
                )}
                {cuentas.map(c => (
                  <tr key={c.id_cuenta} className="transition-hover">
                    <td className="px-4" style={indentStyle(c.nivel)}>
                      <code className="text-primary fw-bold">{c.codigo_cuenta}</code>
                    </td>
                    <td className={`fw-${c.acepta_movimientos ? 'medium' : 'bold'} var-text-dark`}>
                      {!c.acepta_movimientos && <i className="bi bi-folder2 me-1 text-warning"></i>}
                      {c.nombre_cuenta}
                    </td>
                    <td className="text-muted small">{c.tipo_cuenta_nombre}</td>
                    <td>
                      <span className={`badge rounded-pill ${c.naturaleza === 'DEUDORA' ? 'bg-light-info text-info' : 'bg-light-warning text-warning'}`}>{c.naturaleza}</span>
                    </td>
                    <td className="text-center">{c.acepta_movimientos ? <i className="bi bi-check-circle-fill text-success"></i> : <i className="bi bi-dash-circle text-muted"></i>}</td>
                    <td className="text-center">{c.requiere_tercero ? <i className="bi bi-check-circle-fill text-primary"></i> : <i className="bi bi-dash-circle text-muted"></i>}</td>
                    <td>
                      <span className={`badge rounded-pill ${c.estado === 'ACTIVA' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{c.estado}</span>
                    </td>
                    <td className="text-center">
                      <button className={`btn btn-sm action-btn ${c.estado === 'ACTIVA' ? 'text-danger' : 'text-success'}`} onClick={() => toggleEstado(c)} title={c.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}>
                        <i className={`bi ${c.estado === 'ACTIVA' ? 'bi-toggle-on fs-5' : 'bi-toggle-off fs-5'}`}></i>
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
  );
}