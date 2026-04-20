import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EjercicioFiscal from '../src/modules/accounting/EjercicioFiscal';
import CatalogoCuentas from '../src/modules/accounting/CatalogoCuentas';
import TercerosDocumentos from '../src/modules/accounting/TercerosDocumentos';
import RegistroPolizas from '../src/modules/accounting/RegistroPolizas';
import ValidacionesContables from '../src/modules/accounting/ValidacionesContables';
import CierreContable from '../src/modules/accounting/CierreContable';

const iconosModulos = {
  'Dashboard Principal': 'bi-house-door', 'Seguridad y acceso': 'bi-shield-lock', 'Usuarios': 'bi-people', 'Roles': 'bi-person-badge-fill', 'Asignar Roles': 'bi-key', 'Permisos': 'bi-lock', 'Bitácora': 'bi-journal-text', 'Configuración de empresa': 'bi-gear', 'Datos empresa': 'bi-building', 'Moneda': 'bi-currency-dollar', 'Zona horaria': 'bi-clock-history', 'Parámetros': 'bi-toggles2', 'Catálogos maestros': 'bi-list-ul', 'Tipos de cuenta': 'bi-wallet2', 'Tipos de póliza': 'bi-file-earmark-ruled', 'Estados': 'bi-signpost-split', 'Documentos': 'bi-file-earmark-text', 'Contabilidad': 'bi-calculator', 'Ejercicio fiscal y períodos': 'bi-calendar3', 'Catálogo de cuentas': 'bi-tree', 'Terceros y documentos fuente': 'bi-person-lines-fill', 'Registro de pólizas': 'bi-receipt', 'Validaciones contables': 'bi-patch-check', 'Cierre contable': 'bi-box-arrow-right', 'Auditoría completa': 'bi-search-heart', 'Consultas y reportes base': 'bi-bar-chart-line'
};

const modules = [
  { name: 'Seguridad y acceso', phase: 1, children: ['Usuarios', 'Roles', 'Asignar Roles', 'Permisos', 'Bitácora'] },
  { name: 'Configuración de empresa', phase: 1, children: ['Datos empresa', 'Moneda', 'Zona horaria', 'Parámetros'] },
  { name: 'Catálogos maestros', phase: 1, children: ['Tipos de cuenta', 'Tipos de póliza', 'Estados', 'Documentos'] },
  { name: 'Contabilidad', phase: 2, children: ['Ejercicio fiscal y períodos', 'Catálogo de cuentas', 'Terceros y documentos fuente', 'Registro de pólizas', 'Validaciones contables', 'Cierre contable'] },
  { name: 'Auditoría completa', phase: 4, children: [] },
  { name: 'Consultas y reportes base', phase: 4, children: [] },
];

const mapaPermisos = {
  'Usuarios': 'USUARIO_VER', 'Roles': 'ROL_VER', 'Asignar Roles': 'ROL_ASIGNAR', 'Permisos': 'ROL_ASIGNAR', 'Bitácora': 'BITACORA_VER',
  'Datos empresa': 'EMPRESA_VER', 'Moneda': 'EMPRESA_VER', 'Zona horaria': 'EMPRESA_VER', 'Parámetros': 'EMPRESA_VER',
  'Tipos de cuenta': 'CUENTA_VER', 'Tipos de póliza': 'POLIZA_VER', 'Estados': 'POLIZA_VER', 'Documentos': 'DOCUMENTO_VER',
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="card stat-card border-0 shadow-sm rounded-4 h-100 transition-hover">
    <div className="card-body d-flex align-items-center">
      <div className={`icon-shape bg-light-${color} text-${color} rounded-circle me-3`}><i className={`bi ${icon} fs-4`}></i></div>
      <div><p className="text-muted small mb-0 fw-medium">{title}</p><h4 className="mb-0 fw-bold var-text-dark">{value}</h4></div>
    </div>
  </div>
);

const dataGrafico = [
  { mes: 'Ene', ingresos: 4000, egresos: 2400 },
  { mes: 'Feb', ingresos: 3000, egresos: 1398 },
  { mes: 'Mar', ingresos: 5000, egresos: 3800 },
  { mes: 'Abr', ingresos: 2780, egresos: 3908 },
  { mes: 'May', ingresos: 6890, egresos: 4800 },
  { mes: 'Jun', ingresos: 8390, egresos: 3800 },
];

export default function Home() {
  const router = useRouter();
  // === TRUCO ANTI ERROR DE HIDRATACIÓN ===
  const [isMounted, setIsMounted] = useState(false);

  const [selected, setSelected] = useState('Dashboard Principal');
  const [darkMode, setDarkMode] = useState(false);
  const [busquedaTerceros, setBusquedaTerceros] = useState('');
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('');

  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'success' }), 4000);
  };

  const [terceros, setTerceros] = useState([]);
  const [nuevoTercero, setNuevoTercero] = useState({ tipo: 'CLIENTE', nombre: '', nit: '' });
  const [empresas, setEmpresas] = useState([]);
  const estadoInicialEmpresa = { nombre_legal: '', nombre_comercial: '', nit: '', direccion: '', telefono: '', correo_electronico: '', estado: 'ACTIVO' };
  const [nuevaEmpresa, setNuevaEmpresa] = useState(estadoInicialEmpresa);
  const [modoEdicionEmpresa, setModoEdicionEmpresa] = useState(false);
  const [idEditandoEmpresa, setIdEditandoEmpresa] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const estadoInicialUsuario = { id_empresa: '', nombres: '', apellidos: '', nombre_usuario: '', correo_electronico: '', contrasena: '', estado: 'ACTIVO' };
  const [nuevoUsuario, setNuevoUsuario] = useState(estadoInicialUsuario);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState({ nombre_rol: '', descripcion: '', estado: 'ACTIVO' });
  const [modoEdicionRol, setModoEdicionRol] = useState(false);
  const [idEditandoRol, setIdEditandoRol] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({ id_usuario: '', id_rol: '' });
  const [parametros, setParametros] = useState({ formato_numero_poliza: 'MENSUAL', maximo_decimales: 2, maneja_centros_costo: false, permite_edicion_poliza_aprobada: false, requiere_documento_fuente: true });
  const [bitacora, setBitacora] = useState([]);
  const [loadingBitacora, setLoadingBitacora] = useState(false);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [asignacionesPermisos, setAsignacionesPermisos] = useState([]);
  const [rolSeleccionadoPermisos, setRolSeleccionadoPermisos] = useState('');
  const [permisosMarcados, setPermisosMarcados] = useState([]);
  const [loadingGuardarPermisos, setLoadingGuardarPermisos] = useState(false);
  const [misPermisos, setMisPermisos] = useState([]);
  const [nombreUsuarioLogueado, setNombreUsuarioLogueado] = useState('Usuario');
  const [idMiEmpresa, setIdMiEmpresa] = useState(1);
  const [modulosAbiertos, setModulosAbiertos] = useState({});

  useEffect(() => {
    setIsMounted(true); // Le decimos que ya estamos listos en el navegador
    if (typeof window !== 'undefined') {
      const permisosGuardados = JSON.parse(localStorage.getItem('permisos') || '[]');
      const infoUsuario = JSON.parse(localStorage.getItem('usuario') || '{"nombre": "Usuario", "id_empresa": 1}');
      setMisPermisos(permisosGuardados);
      setNombreUsuarioLogueado(infoUsuario.nombre);
      setIdMiEmpresa(parseInt(infoUsuario.id_empresa) || 1);
      
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      if (isDark) document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  };

  const cerrarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('permisos');
      localStorage.removeItem('darkMode');
    }

    document.cookie = 'siac_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.body.classList.remove('dark-theme');
    router.push('/web');
  };

  useEffect(() => {
    if (!isMounted) return; // Solo cargar si ya estamos listos
    if (selected === 'Dashboard Principal') cargarTerceros();
    if (selected === 'Usuarios') { cargarEmpresas(); cargarUsuarios(); setBusquedaUsuarios(''); } 
    if (selected === 'Roles') cargarRoles();
    if (selected === 'Asignar Roles') { cargarUsuarios(); cargarRoles(); cargarAsignaciones(); }
    if (selected === 'Datos empresa') cargarEmpresas(); 
    if (selected === 'Parámetros') cargarParametros();
    if (selected === 'Bitácora') cargarBitacora();
    if (selected === 'Permisos') { cargarRoles(); cargarDataPermisos(); }
  }, [selected, isMounted]);

  useEffect(() => {
    if (rolSeleccionadoPermisos) {
      const permisosDelRol = asignacionesPermisos.filter(a => a.id_rol === parseInt(rolSeleccionadoPermisos)).map(a => a.id_permiso);
      setPermisosMarcados(permisosDelRol);
    } else setPermisosMarcados([]);
  }, [rolSeleccionadoPermisos, asignacionesPermisos]);

  useEffect(() => {
    const moduloActivo = modules.find((m) => m.children.includes(selected))?.name;
    if (moduloActivo) {
      setModulosAbiertos((prev) => ({ ...prev, [moduloActivo]: true }));
    }
  }, [selected]);

  const cargarTerceros = async () => { const res = await fetch(`/api/terceros?id_empresa=${idMiEmpresa}`); const data = await res.json(); if (data.success) setTerceros(data.data); };
  const guardarTercero = async (e) => { e.preventDefault(); try { const res = await fetch('/api/terceros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...nuevoTercero, id_empresa: idMiEmpresa }) }); const data = await res.json(); if (data.success) { setNuevoTercero({ tipo: 'CLIENTE', nombre: '', nit: '' }); cargarTerceros(); mostrarToast('Tercero registrado con éxito'); } else { mostrarToast('Error: ' + data.error, 'danger'); } } catch (err) { mostrarToast('Error de conexión', 'danger'); } };
  const cargarEmpresas = async () => { const res = await fetch('/api/empresa'); const data = await res.json(); if (data.success) { if (idMiEmpresa === 1) { setEmpresas(data.data); } else { setEmpresas(data.data.filter(emp => parseInt(emp.id_empresa) === idMiEmpresa)); } } };
  const guardarEmpresa = async (e) => { e.preventDefault(); const method = modoEdicionEmpresa ? 'PUT' : 'POST'; try { const res = await fetch('/api/empresa', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modoEdicionEmpresa ? { ...nuevaEmpresa, id_empresa: idEditandoEmpresa } : nuevaEmpresa) }); const data = await res.json(); if (data.success) { mostrarToast(modoEdicionEmpresa ? 'Bufete actualizado' : 'Bufete creado'); cancelarEdicionEmpresa(); cargarEmpresas(); } } catch (err) { mostrarToast('Error de conexión', 'danger'); } };
  const activarEdicionEmpresa = (emp) => { setModoEdicionEmpresa(true); setIdEditandoEmpresa(emp.id_empresa); setNuevaEmpresa({ nombre_legal: emp.nombre_legal, nombre_comercial: emp.nombre_comercial || '', nit: emp.nit, direccion: emp.direccion || '', telefono: emp.telefono || '', correo_electronico: emp.correo_electronico || '', estado: emp.estado }); };
  const cancelarEdicionEmpresa = () => { setModoEdicionEmpresa(false); setIdEditandoEmpresa(null); setNuevaEmpresa(estadoInicialEmpresa); };
  const cargarUsuarios = async () => { const res = await fetch(`/api/usuarios?id_empresa=${idMiEmpresa}`); const data = await res.json(); if (data.success) setUsuarios(data.data); };
  const guardarUsuario = async (e) => { e.preventDefault(); const method = modoEdicion ? 'PUT' : 'POST'; await fetch('/api/usuarios', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modoEdicion ? { ...nuevoUsuario, id_usuario: idEditando } : nuevoUsuario) }); cancelarEdicion(); cargarUsuarios(); mostrarToast(modoEdicion ? 'Usuario actualizado' : 'Usuario registrado'); };
  const activarEdicion = (u) => { setModoEdicion(true); setIdEditando(u.id_usuario); setNuevoUsuario({ id_empresa: u.id_empresa || '', nombres: u.nombres, apellidos: u.apellidos, nombre_usuario: u.nombre_usuario, correo_electronico: u.correo_electronico, contrasena: '', estado: u.estado }); };
  const cancelarEdicion = () => { setModoEdicion(false); setIdEditando(null); setNuevoUsuario(estadoInicialUsuario); };
  const toggleEstado = async (u) => { const n = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'; if(confirm(`¿Cambiar estado a ${n}?`)) { await fetch('/api/usuarios', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...u, estado: n, contrasena: '' }) }); cargarUsuarios(); mostrarToast('Estado actualizado'); } };
  const cargarRoles = async () => { const res = await fetch('/api/roles'); const data = await res.json(); if (data.success) setRoles(data.data); };
  const guardarRol = async (e) => { e.preventDefault(); const method = modoEdicionRol ? 'PUT' : 'POST'; await fetch('/api/roles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modoEdicionRol ? { ...nuevoRol, id_rol: idEditandoRol } : nuevoRol) }); cancelarEdicionRol(); cargarRoles(); mostrarToast('Rol guardado'); };
  const activarEdicionRol = (r) => { setModoEdicionRol(true); setIdEditandoRol(r.id_rol); setNuevoRol({ nombre_rol: r.nombre_rol, descripcion: r.descripcion || '', estado: r.estado }); };
  const cancelarEdicionRol = () => { setModoEdicionRol(false); setIdEditandoRol(null); setNuevoRol({ nombre_rol: '', descripcion: '', estado: 'ACTIVO' }); };
  const cargarAsignaciones = async () => { const res = await fetch(`/api/asignacion?id_empresa=${idMiEmpresa}`); const data = await res.json(); if (data.success) setAsignaciones(data.data); };
  const guardarAsignacion = async (e) => { e.preventDefault(); if (!nuevaAsignacion.id_usuario || !nuevaAsignacion.id_rol) return mostrarToast('Selecciona usuario y rol', 'danger'); await fetch('/api/asignacion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaAsignacion) }); setNuevaAsignacion({ id_usuario: '', id_rol: '' }); cargarAsignaciones(); mostrarToast('Rol asignado exitosamente'); };
  const revocarAsignacion = async (id_usuario, id_rol) => { if(confirm(`¿Quitar rol?`)) { await fetch('/api/asignacion', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario, id_rol }) }); cargarAsignaciones(); mostrarToast('Rol revocado'); } };
  const cargarParametros = async () => { const res = await fetch('/api/parametros'); const data = await res.json(); if (data.success && data.data) setParametros(data.data); };
  const guardarParametros = async (e) => { e.preventDefault(); await fetch('/api/parametros', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parametros) }); mostrarToast('Parámetros actualizados'); };
  const cargarBitacora = async () => { setLoadingBitacora(true); const res = await fetch(`/api/bitacora?id_empresa=${idMiEmpresa}`); const data = await res.json(); if (data.success) setBitacora(data.data); setLoadingBitacora(false); };
  const cargarDataPermisos = async () => { const res = await fetch('/api/permisos'); const data = await res.json(); if (data.success) { setPermisosDisponibles(data.permisos); setAsignacionesPermisos(data.asignaciones); } };
  const togglePermiso = (id_permiso) => { setPermisosMarcados(prev => prev.includes(id_permiso) ? prev.filter(id => id !== id_permiso) : [...prev, id_permiso]); };
  const guardarPermisosUI = async (e) => { e.preventDefault(); setLoadingGuardarPermisos(true); await fetch('/api/permisos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_rol: parseInt(rolSeleccionadoPermisos), permisos: permisosMarcados }) }); mostrarToast('Matriz de permisos actualizada'); cargarDataPermisos(); setLoadingGuardarPermisos(false); };
  const toggleModuloMenu = (nombreModulo) => {
    setModulosAbiertos((prev) => ({ ...prev, [nombreModulo]: !prev[nombreModulo] }));
  };

  const modulosFiltrados = modules.map(m => {
    const childrenPermitidos = m.children.filter(c => {
      const permisoRequerido = mapaPermisos[c];
      return !permisoRequerido || misPermisos.includes(permisoRequerido);
    });
    return { ...m, children: childrenPermitidos };
  }).filter(m => m.children.length > 0);

  // Si no está montado (cargando en el server), no renderizamos nada para evitar el error de hidratación
  if (!isMounted) return null;

  const renderContent = () => {
    if (selected === 'Dashboard Principal') { 
      const tieneAccesoAvanzado = misPermisos.includes('USUARIO_VER') && misPermisos.includes('ROL_VER');
      if (!tieneAccesoAvanzado) {
        return (<div className="container mt-5 pt-5 text-center"><h1 className="text-primary fw-bold mb-3">¡Bienvenido a SIAC!</h1><p className="text-muted fs-5">Has iniciado sesión como <span className="fw-bold var-text-dark">@{nombreUsuarioLogueado}</span>.</p></div>);
      }
      
      const tercerosFiltrados = terceros.filter(t => 
        t.nombre_razon_social.toLowerCase().includes(busquedaTerceros.toLowerCase()) || 
        (t.identificacion_fiscal && t.identificacion_fiscal.includes(busquedaTerceros))
      );

      return (
        <div className="container-fluid mt-4 px-3 fade-in">
          <div className="row mb-4 g-3">
            <div className="col-md-3"><StatCard title="Terceros Registrados" value={terceros.length} icon="bi-people-fill" color="primary" /></div>
            <div className="col-md-3"><StatCard title="Bufetes en Red" value={idMiEmpresa === 1 ? empresas.length : 1} icon="bi-building-fill" color="success" /></div>
            <div className="col-md-3"><StatCard title="Ingresos (Mes)" value="Q 24,500" icon="bi-graph-up-arrow" color="teal" /></div>
            <div className="col-md-3"><StatCard title="Egresos (Mes)" value="Q 12,300" icon="bi-graph-down-arrow" color="danger" /></div>
          </div>
          
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold var-text-dark">Resumen Financiero Anual</h6>
                    <p className="text-muted small mb-0">Comparativa de ingresos y egresos</p>
                  </div>
                  <span className="badge bg-light-primary text-primary rounded-pill px-3 py-2">Año 2026</span>
                </div>
                <div className="card-body px-4 pb-4" style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#3a3f58" : "#E0E5F2"} />
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 13, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 13}} dx={-10} />
                      <Tooltip cursor={{fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(67, 24, 255, 0.04)'}} contentStyle={{backgroundColor: darkMode ? '#1e2136' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: darkMode ? '#fff' : '#000'}} />
                      <Bar dataKey="ingresos" name="Ingresos (Q)" fill="#4318FF" radius={[6, 6, 0, 0]} barSize={25} />
                      <Bar dataKey="egresos" name="Egresos (Q)" fill="#05CD99" radius={[6, 6, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-4"><div className="card shadow-sm border-0 rounded-4 h-100"><div className="card-header var-bg-white border-0 pt-4 pb-0 px-4"><h6 className="mb-0 fw-bold var-text-dark">Test API: Tercero</h6><p className="text-muted small">Prueba inserción</p></div><div className="card-body px-4 pb-4"><form onSubmit={guardarTercero}><div className="mb-3"><label className="form-label small fw-medium text-muted">Tipo</label><select className="form-select border-light-gray" value={nuevoTercero.tipo} onChange={(e) => setNuevoTercero({...nuevoTercero, tipo: e.target.value})}><option value="CLIENTE">Cliente</option><option value="PROVEEDOR">Proveedor</option></select></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Nombre Completo</label><input type="text" className="form-control border-light-gray" required value={nuevoTercero.nombre} onChange={(e) => setNuevoTercero({...nuevoTercero, nombre: e.target.value})} /></div><div className="mb-4"><label className="form-label small fw-medium text-muted">NIT</label><input type="text" className="form-control border-light-gray" value={nuevoTercero.nit} onChange={(e) => setNuevoTercero({...nuevoTercero, nit: e.target.value})} /></div><button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm">Guardar Registro</button></form></div></div></div>
            <div className="col-md-8"><div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-header var-bg-white border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
                <div><h6 className="mb-0 fw-bold var-text-dark">Registros Actuales</h6><p className="text-muted small">Datos de {idMiEmpresa === 1 ? 'Todos los Bufetes' : 'Tu Bufete'}</p></div>
                <div className="input-group" style={{maxWidth: '220px'}}>
                  <span className="input-group-text var-bg-white border-end-0 text-muted border-light-gray rounded-start-pill ps-3"><i className="bi bi-search"></i></span>
                  <input type="text" className="form-control border-start-0 ps-1 border-light-gray rounded-end-pill focus-none var-bg-white" placeholder="Buscar tercero..." value={busquedaTerceros} onChange={(e) => setBusquedaTerceros(e.target.value)}/>
                </div>
              </div>
              <div className="card-body p-0 pt-2"><div className="table-responsive"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">ID</th><th>Tipo</th><th>Nombre</th><th>NIT</th></tr></thead><tbody>
                {tercerosFiltrados.length === 0 ? (<tr><td colSpan="4" className="text-center py-5 text-muted fst-italic">No hay coincidencias.</td></tr>) : 
                tercerosFiltrados.map((t) => (<tr key={t.id_tercero}><td className="px-4 fw-medium text-muted">{t.id_tercero}</td><td><span className={`badge rounded-pill ${t.tipo_tercero === 'CLIENTE' ? 'bg-light-success text-success' : 'bg-light-warning text-warning'}`}>{t.tipo_tercero}</span></td><td className="fw-bold var-text-dark">{t.nombre_razon_social}</td><td className="text-muted small">{t.identificacion_fiscal || 'N/A'}</td></tr>))}
              </tbody></table></div></div></div></div>
          </div>
        </div>
      ); 
    }

    if (selected === 'Usuarios') { 
      const usuariosAMostrar = usuarios.filter(u => u.nombre_usuario.toLowerCase().includes(busquedaUsuarios.toLowerCase()) || u.nombres.toLowerCase().includes(busquedaUsuarios.toLowerCase()));
      const usuariosSinAsignar = usuariosAMostrar.filter(u => !u.id_empresa || !empresas.some(emp => emp.id_empresa === u.id_empresa));
      
      return (
        <div className="container-fluid mt-4 px-3 fade-in"><div className="row">
          <div className="col-md-4 mb-4"><div className="card shadow-sm border-0 rounded-4 sticky-top-custom"><div className={`card-header text-white border-0 rounded-top-4 pt-3 pb-3 ${modoEdicion ? 'bg-warning text-dark' : 'bg-success'}`}><h6 className="mb-0 fw-bold">{modoEdicion ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}</h6></div><div className="card-body p-4">
            <form onSubmit={guardarUsuario}>
              <div className="mb-3 border-bottom border-light pb-3"><label className="form-label small fw-bold text-primary">Asignar a Bufete *</label><select className="form-select border-primary bg-light-primary var-text-dark" required value={nuevoUsuario.id_empresa} onChange={(e) => setNuevoUsuario({...nuevoUsuario, id_empresa: e.target.value})}><option value="">-- Selecciona --</option>{empresas.filter(emp => emp.estado === 'ACTIVO').map(emp => (<option key={emp.id_empresa} value={emp.id_empresa}>{emp.nombre_legal}</option>))}</select></div>
              <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-medium text-muted">Nombres</label><input type="text" className="form-control focus-primary" required value={nuevoUsuario.nombres} onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombres: e.target.value})} /></div><div className="col-6 mb-3"><label className="form-label small fw-medium text-muted">Apellidos</label><input type="text" className="form-control focus-primary" required value={nuevoUsuario.apellidos} onChange={(e) => setNuevoUsuario({...nuevoUsuario, apellidos: e.target.value})} /></div></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Nombre de Usuario</label><div className="input-group"><span className="input-group-text var-bg-light border-light-gray text-muted">@</span><input type="text" className="form-control focus-primary" required value={nuevoUsuario.nombre_usuario} onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre_usuario: e.target.value})} /></div></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Correo Electrónico</label><input type="email" className="form-control focus-primary" required value={nuevoUsuario.correo_electronico} onChange={(e) => setNuevoUsuario({...nuevoUsuario, correo_electronico: e.target.value})} /></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Contraseña {modoEdicion && <span className="text-muted">(Opcional)</span>}</label><input type="password" className="form-control focus-primary" required={!modoEdicion} value={nuevoUsuario.contrasena} onChange={(e) => setNuevoUsuario({...nuevoUsuario, contrasena: e.target.value})} /></div><div className="mb-4"><label className="form-label small fw-medium text-muted">Estado Cuenta</label><select className="form-select focus-primary" value={nuevoUsuario.estado} onChange={(e) => setNuevoUsuario({...nuevoUsuario, estado: e.target.value})}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">INACTIVO</option></select></div><button type="submit" className={`btn w-100 rounded-pill fw-bold shadow-sm ${modoEdicion ? 'btn-warning text-dark' : 'btn-success'}`}>{modoEdicion ? 'Guardar Cambios' : 'Registrar Empleado'}</button>{modoEdicion && <button type="button" className="btn var-btn-light border w-100 rounded-pill mt-2 fw-medium" onClick={cancelarEdicion}>Cancelar</button>}
            </form>
          </div></div></div>
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div><h5 className="mb-0 fw-bold var-text-dark">Organigrama de Acceso</h5><p className="text-muted small mb-0">Gestión de credenciales Multi-SaaS</p></div>
              <div className="input-group shadow-sm rounded-pill border-light-gray border" style={{maxWidth: '250px'}}>
                  <span className="input-group-text var-bg-white border-0 text-muted rounded-start-pill ps-3"><i className="bi bi-search"></i></span>
                  <input type="text" className="form-control border-0 ps-1 rounded-end-pill focus-none var-bg-white" placeholder="Buscar usuario..." value={busquedaUsuarios} onChange={(e) => setBusquedaUsuarios(e.target.value)}/>
              </div>
            </div>
            
            {usuariosSinAsignar.length > 0 && idMiEmpresa === 1 && (<div className="card shadow-sm border-danger rounded-4 mb-4"><div className="card-header bg-danger text-white border-0 pt-3 pb-3 rounded-top-4 d-flex justify-content-between align-items-center"><h6 className="mb-0 fw-bold">⚠️ Usuarios sin Bufete asignado</h6><span className="badge bg-white text-danger rounded-pill px-3">{usuariosSinAsignar.length}</span></div><div className="card-body p-0"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">Usuario</th><th>Nombre Completo</th><th className="text-end px-4">Acciones</th></tr></thead><tbody>{usuariosSinAsignar.map((u) => (<tr key={u.id_usuario}><td className="px-4 fw-bold">@{u.nombre_usuario}</td><td>{u.nombres} {u.apellidos}</td><td className="text-end px-4"><button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => activarEdicion(u)}>Editar y Asignar</button></td></tr>))}</tbody></table></div></div>)}
            {empresas.map(empresa => {
              const empleadosDeEstaEmpresa = usuariosAMostrar.filter(u => u.id_empresa === empresa.id_empresa);
              if (empleadosDeEstaEmpresa.length === 0 && busquedaUsuarios !== '') return null; 

              return (<div key={empresa.id_empresa} className="card shadow-sm mb-4 border-0 rounded-4 slide-up"><div className="card-header bg-dark text-white border-0 pt-3 pb-3 rounded-top-4 d-flex justify-content-between align-items-center"><h6 className="mb-0 fw-bold">🏢 {empresa.nombre_legal}</h6><span className="badge bg-primary rounded-pill px-3 py-2 fw-medium">{empleadosDeEstaEmpresa.length} Cuentas</span></div><div className="card-body p-0"><div className="table-responsive"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">Usuario</th><th>Nombre Completo</th><th>Estado</th><th className="text-end px-4">Acciones</th></tr></thead><tbody>{empleadosDeEstaEmpresa.length === 0 ? (<tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">Sin empleados.</td></tr>) : (empleadosDeEstaEmpresa.map((u) => (<tr key={u.id_usuario} className="transition-hover"><td className="px-4 fw-bold text-primary">@{u.nombre_usuario}</td><td className="fw-medium var-text-dark">{u.nombres} {u.apellidos}</td><td><span className={`badge rounded-pill ${u.estado === 'ACTIVO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{u.estado}</span></td><td className="text-end px-4"><button className="btn btn-sm var-btn-light border-light-gray rounded-circle me-1 action-btn" onClick={() => activarEdicion(u)} title="Editar"><i className="bi bi-pencil-fill text-primary"></i></button><button className={`btn btn-sm rounded-circle action-btn ${u.estado === 'ACTIVO' ? 'var-btn-light border-light-gray' : 'btn-success shadow-sm'}`} onClick={() => toggleEstado(u)} title={u.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}><i className={`bi ${u.estado === 'ACTIVO' ? 'bi-lock-fill text-danger' : 'bi-unlock-fill text-white'}`}></i></button></td></tr>)))}</tbody></table></div></div></div>);
            })}
          </div>
        </div></div>
      ); 
    }

    if (selected === 'Datos empresa') { 
      return (
        <div className="container-fluid mt-4 px-3 fade-in"><div className="row">
          {idMiEmpresa === 1 && (<div className="col-md-4 mb-4"><div className="card shadow-sm border-0 rounded-4"><div className={`card-header text-white border-0 rounded-top-4 pt-3 pb-3 ${modoEdicionEmpresa ? 'bg-warning text-dark' : 'bg-secondary'}`}><h6 className="mb-0 fw-bold">{modoEdicionEmpresa ? '✏️ Editar Bufete' : '🏢 Nuevo Bufete SaaS'}</h6></div><div className="card-body p-4"><form onSubmit={guardarEmpresa}><div className="mb-3"><label className="form-label small fw-medium text-muted">Nombre Legal / Razón Social *</label><input type="text" className="form-control focus-secondary" required value={nuevaEmpresa.nombre_legal} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, nombre_legal: e.target.value})} /></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Nombre Comercial (Opcional)</label><input type="text" className="form-control focus-secondary" value={nuevaEmpresa.nombre_comercial} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, nombre_comercial: e.target.value})} /></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Identificación Fiscal (NIT) *</label><input type="text" className="form-control focus-secondary" required value={nuevaEmpresa.nit} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, nit: e.target.value})} /></div><div className="row"><div className="col-6 mb-3"><label className="form-label small fw-medium text-muted">Teléfono</label><input type="text" className="form-control focus-secondary" value={nuevaEmpresa.telefono} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, telefono: e.target.value})} /></div><div className="col-6 mb-3"><label className="form-label small fw-medium text-muted">Correo Contacto</label><input type="email" className="form-control focus-secondary" value={nuevaEmpresa.correo_electronico} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, correo_electronico: e.target.value})} /></div></div><div className="mb-4"><label className="form-label small fw-medium text-muted">Dirección Física</label><textarea className="form-control focus-secondary" rows="2" value={nuevaEmpresa.direccion} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, direccion: e.target.value})}></textarea></div>{modoEdicionEmpresa && (<div className="mb-4"><label className="form-label small fw-medium text-muted">Estado Suscripción</label><select className="form-select focus-secondary" value={nuevaEmpresa.estado} onChange={(e) => setNuevaEmpresa({...nuevaEmpresa, estado: e.target.value})}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">INACTIVO</option></select></div>)}<button type="submit" className={`btn w-100 rounded-pill fw-bold shadow-sm ${modoEdicionEmpresa ? 'btn-warning text-dark' : 'btn-secondary text-white'}`}>{modoEdicionEmpresa ? 'Guardar Cambios' : 'Crear Bufete Inquilino'}</button>{modoEdicionEmpresa && <button type="button" className="btn var-btn-light border w-100 rounded-pill mt-2 fw-medium" onClick={cancelarEdicionEmpresa}>Cancelar</button>}</form></div></div></div>)}
          <div className={idMiEmpresa === 1 ? "col-md-8" : "col-md-12"}><div className="card shadow-sm border-0 rounded-4"><div className="card-header bg-dark text-white border-0 pt-3 pb-3 rounded-top-4"><h6 className="mb-0 fw-bold">{idMiEmpresa === 1 ? '🏢 Panel de Inquilinos SaaS' : '🏢 Información de Tu Bufete'}</h6></div><div className="card-body p-0"><div className="table-responsive"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">Nombre Legal</th><th>NIT</th><th>Estado</th><th className="text-end px-4">Acciones</th></tr></thead><tbody>{empresas.map((emp) => (<tr key={emp.id_empresa} className="transition-hover"><td className="px-4 fw-bold var-text-dark">{emp.nombre_legal}</td><td className="text-muted small">{emp.nit}</td><td><span className={`badge rounded-pill ${emp.estado === 'ACTIVO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{emp.estado}</span></td><td className="text-end px-4"><button className="btn btn-sm var-btn-light border-light-gray rounded-pill px-3 fw-medium text-primary action-btn" onClick={() => activarEdicionEmpresa(emp)}><i className="bi bi-pencil-fill me-1"></i>Editar</button></td></tr>))}</tbody></table></div></div></div></div>
        </div></div>
      ); 
    }

    if (selected === 'Roles') { return (<div className="container-fluid mt-4 px-3 fade-in"><div className="row"><div className="col-md-4 mb-4"><div className="card shadow-sm border-0 rounded-4"><div className={`card-header text-dark border-0 rounded-top-4 pt-3 pb-3 bg-light-info`}><h6 className="mb-0 fw-bold">{modoEdicionRol ? '✏️ Editar Rol' : '➕ Crear Nuevo Rol'}</h6></div><div className="card-body p-4"><form onSubmit={guardarRol}><div className="mb-3"><label className="form-label small fw-medium text-muted">Nombre del Rol</label><input type="text" className="form-control focus-info" required placeholder="Ej. Contador" value={nuevoRol.nombre_rol} onChange={(e) => setNuevoRol({...nuevoRol, nombre_rol: e.target.value})} /></div><div className="mb-3"><label className="form-label small fw-medium text-muted">Descripción de Funciones</label><textarea className="form-control focus-info" rows="3" placeholder="¿Qué responsabilidades tiene?" value={nuevoRol.descripcion} onChange={(e) => setNuevoRol({...nuevoRol, descripcion: e.target.value})}></textarea></div><div className="mb-4"><label className="form-label small fw-medium text-muted">Estado Rol</label><select className="form-select focus-info" value={nuevoRol.estado} onChange={(e) => setNuevoRol({...nuevoRol, estado: e.target.value})}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">INACTIVO</option></select></div><button type="submit" className={`btn btn-info w-100 rounded-pill fw-bold text-dark shadow-sm`}>{modoEdicionRol ? 'Guardar Cambios' : 'Registrar Rol'}</button>{modoEdicionRol && <button type="button" className="btn var-btn-light border w-100 rounded-pill mt-2 fw-medium" onClick={cancelarEdicionRol}>Cancelar</button>}</form></div></div></div><div className="col-md-8"><div className="card shadow-sm border-0 rounded-4 h-100"><div className="card-header var-bg-white border-0 pt-4 pb-0 px-4"><h6 className="mb-0 fw-bold var-text-dark">Matriz de Roles Definidos</h6><p className="text-muted small">Estructura base para permisos de seguridad</p></div><div className="card-body p-0 pt-2"><div className="table-responsive"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">ID</th><th>Rol</th><th>Descripción</th><th>Estado</th><th className="text-end px-4">Acciones</th></tr></thead><tbody>{roles.map((r) => (<tr key={r.id_rol} className="transition-hover"><td className="px-4 text-muted small">{r.id_rol}</td><td className="fw-bold var-text-dark">{r.nombre_rol}</td><td className="text-muted small text-truncate" style={{maxWidth: '250px'}} title={r.descripcion}>{r.descripcion}</td><td><span className={`badge rounded-pill ${r.estado === 'ACTIVO' ? 'bg-light-success text-success' : 'bg-light-danger text-danger'}`}>{r.estado}</span></td><td className="text-end px-4"><button className="btn btn-sm var-btn-light border-light-gray rounded-pill px-3 fw-medium text-primary action-btn" onClick={() => activarEdicionRol(r)}><i className="bi bi-pencil-fill me-1"></i>Editar</button></td></tr>))}</tbody></table></div></div></div></div></div></div>); }
    if (selected === 'Asignar Roles') { return (<div className="container-fluid mt-4 px-3 fade-in"><div className="row"><div className="col-md-4 mb-4"><div className="card shadow-sm border-0 rounded-4"><div className="card-header bg-light-primary text-primary border-0 rounded-top-4 pt-3 pb-3"><h6 className="mb-0 fw-bold">🔗 Vincular Rol a Usuario</h6></div><div className="card-body p-4"><form onSubmit={guardarAsignacion}><div className="mb-3"><label className="form-label small fw-medium text-muted">Seleccionar Usuario</label><select className="form-select border-primary bg-light-primary focus-primary" value={nuevaAsignacion.id_usuario} onChange={(e) => setNuevaAsignacion({...nuevaAsignacion, id_usuario: e.target.value})}><option value="">-- Elige --</option>{usuarios.filter(u => u.estado === 'ACTIVO').map(u => (<option key={u.id_usuario} value={u.id_usuario}>{u.nombre_usuario} ({u.nombres})</option>))}</select></div><div className="mb-4"><label className="form-label small fw-medium text-muted">Seleccionar Rol</label><select className="form-select border-primary bg-light-primary focus-primary" value={nuevaAsignacion.id_rol} onChange={(e) => setNuevaAsignacion({...nuevaAsignacion, id_rol: e.target.value})}><option value="">-- Elige --</option>{roles.filter(r => r.estado === 'ACTIVO').map(r => (<option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>))}</select></div><button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm">Ejecutar Asignación</button></form></div></div></div><div className="col-md-8"><div className="card shadow-sm border-0 rounded-4 h-100"><div className="card-header var-bg-white border-0 pt-4 pb-0 px-4"><h6 className="mb-0 fw-bold var-text-dark">Matriz de Personal y Roles</h6><p className="text-muted small">Cuentas activas en tu bufete y sus funciones</p></div><div className="card-body p-0 pt-2"><div className="table-responsive"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">Usuario</th><th>Rol Asignado</th><th className="text-end px-4">Acciones</th></tr></thead><tbody>{asignaciones.map((a) => (<tr key={`${a.id_usuario}-${a.id_rol}`} className="transition-hover"><td className="px-4 fw-bold text-primary">@{a.nombre_usuario}</td><td><span className="badge var-bg-light var-text-dark rounded-pill border border-light-gray fw-medium px-3">{a.nombre_rol}</span></td><td className="text-end px-4"><button className="btn btn-sm var-btn-light border-light-gray text-danger rounded-pill px-3 fw-medium action-btn" onClick={() => revocarAsignacion(a.id_usuario, a.id_rol)}><i className="bi bi-trash3-fill me-1"></i>Revocar</button></td></tr>))}</tbody></table></div></div></div></div></div></div>); }
    if (selected === 'Parámetros') { return (<div className="container mt-4 fade-in"><div className="row justify-content-center"><div className="col-md-8"><div className="card shadow-sm border-0 rounded-4"><div className="card-header bg-light-info text-dark border-0 rounded-top-4 pt-3 pb-3"><h6 className="mb-0 fw-bold">📊 Configuración de Parámetros Contables</h6></div><div className="card-body p-4"><form onSubmit={guardarParametros}><div className="row mb-4"><div className="col-md-6 mb-3"><label className="form-label small fw-medium text-muted">Formato Numeración Pólizas</label><select className="form-select focus-info" value={parametros.formato_numero_poliza} onChange={(e) => setParametros({...parametros, formato_numero_poliza: e.target.value})}><option value="MENSUAL">Mensual (AAAA-MM-XXXX)</option><option value="ANUAL">Anual (AAAA-XXXXXX)</option></select></div><div className="col-md-6 mb-3"><label className="form-label small fw-medium text-muted">Máximo de Decimales Cálculos</label><input type="number" min="0" max="4" className="form-control focus-info" value={parametros.maximo_decimales} onChange={(e) => setParametros({...parametros, maximo_decimales: parseInt(e.target.value)})} /></div></div><div className="row mb-4 g-3"><div className="col-md-4"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="maneja_centros" checked={parametros.maneja_centros_costo} onChange={(e) => setParametros({...parametros, maneja_centros_costo: e.target.checked})} /><label className="form-check-label small var-text-dark fw-medium" htmlFor="maneja_centros">Maneja Centros de Costo</label></div></div><div className="col-md-4"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="permite_edicion" checked={parametros.permite_edicion_poliza_aprobada} onChange={(e) => setParametros({...parametros, permite_edicion_poliza_aprobada: e.target.checked})} /><label className="form-check-label small var-text-dark fw-medium" htmlFor="permite_edicion">Permite Editar Póliza Aprobada</label></div></div><div className="col-md-4"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="requiere_doc" checked={parametros.requiere_documento_fuente} onChange={(e) => setParametros({...parametros, requiere_documento_fuente: e.target.checked})} /><label className="form-check-label small var-text-dark fw-medium" htmlFor="requiere_doc">Requiere Documento Fuente</label></div></div></div><div className="d-flex justify-content-end border-top border-light-gray pt-3"><button type="submit" className="btn btn-info px-5 rounded-pill fw-bold text-dark shadow-sm">Guardar Parametrización</button></div></form></div></div></div></div></div>); }
    if (selected === 'Bitácora') { return (<div className="container-fluid mt-4 px-3 fade-in"><div className="card shadow-sm border-0 rounded-4"><div className="card-header bg-dark text-white border-0 rounded-top-4 pt-3 pb-3 d-flex justify-content-between align-items-center"><h6 className="mb-0 fw-bold">📜 Auditoría de Eventos del Sistema</h6><button className="btn btn-sm btn-outline-light rounded-pill px-3 fw-medium" onClick={cargarBitacora} disabled={loadingBitacora}>{loadingBitacora ? 'Cargando...' : '🔄 Actualizar'}</button></div><div className="card-body p-0 pt-2"><div className="table-responsive"><table className="table table-hover table-borderless mb-0 align-middle modern-table"><thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">Fecha Evento</th><th>Usuario</th><th>Acción</th><th>Tabla/Recurso</th><th>IP Origen</th></tr></thead><tbody>{!bitacora || bitacora.length === 0 ? (<tr><td colSpan="5" className="text-center py-5 text-muted fst-italic"><i className="bi bi-clock-history fs-2 d-block mb-2"></i>Aún no hay registros en la auditoría.</td></tr>) : (bitacora.map((b) => (<tr key={b.id_bitacora} className="transition-hover"><td className="small px-4 var-text-dark fw-medium">{new Date(b.fecha_evento).toLocaleString()}</td><td><span className="fw-bold text-primary">@{b.nombre_usuario || 'desconocido'}</span></td><td><span className={`badge rounded-pill ${b.accion === 'LOGIN' ? 'bg-light-success text-success' : 'bg-light-info text-info'}`}>{b.accion}</span></td><td className="text-muted small">{b.tabla_afectada || 'N/A'}</td><td className="small text-secondary">{b.direccion_ip || 'Desconocida'}</td></tr>)))}</tbody></table></div></div></div></div>); }
    if (selected === 'Permisos') {
      const modulosApp = [...new Set(permisosDisponibles.map(p => p.modulo))];
      return (
        <div className="container-fluid mt-4 px-3 fade-in"><div className="card shadow-sm border-0 rounded-4"><div className="card-header bg-dark text-white border-0 rounded-top-4 pt-3 pb-3"><h6 className="mb-0 fw-bold">🔐 Matriz de Permisos de Seguridad</h6></div><div className="card-body p-4 var-bg-light-gray rounded-bottom-4"><div className="row mb-4 justify-content-center"><div className="col-md-6"><div className="card border-primary shadow-sm rounded-4"><div className="card-body p-3"><label className="fw-bold mb-2 text-primary small text-uppercase">1. Selecciona el Rol objetivo:</label><select className="form-select border-primary form-select-lg fw-bold rounded-3 focus-primary var-text-dark" value={rolSeleccionadoPermisos} onChange={e => setRolSeleccionadoPermisos(e.target.value)}><option value="">-- Elige un Rol --</option>{roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}</select></div></div></div></div>{rolSeleccionadoPermisos ? (<form onSubmit={guardarPermisosUI}><div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-light-gray pb-2"><h6 className="fw-bold mb-0 var-text-dark">2. Define los accesos para este Rol:</h6><button type="submit" className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm" disabled={loadingGuardarPermisos}>{loadingGuardarPermisos ? 'Guardando...' : '💾 Guardar Cambios en Matriz'}</button></div><div className="row g-3">{modulosApp.map(modulo => (<div key={modulo} className="col-md-4 mb-3"><div className="card h-100 border-0 shadow-sm rounded-3 transition-hover"><div className="card-header bg-secondary text-white py-2 rounded-top-3 border-0"><h6 className="mb-0 small text-uppercase fw-bold"><i className="bi bi-folder2-open me-2"></i>{modulo}</h6></div><div className="card-body py-2 px-3">{permisosDisponibles.filter(p => p.modulo === modulo).map(permiso => (<div key={permiso.id_permiso} className="form-check mb-1 border-bottom border-light-gray pb-1"><input className="form-check-input" type="checkbox" id={`perm-${permiso.id_permiso}`} checked={permisosMarcados.includes(permiso.id_permiso)} onChange={() => togglePermiso(permiso.id_permiso)} /><label className="form-check-label small w-100 fw-medium var-text-dark" htmlFor={`perm-${permiso.id_permiso}`} style={{cursor:'pointer'}} title={permiso.descripcion}>{permiso.nombre_permiso}<span className="text-muted d-block small" style={{fontSize: '0.7rem'}}>{permiso.codigo_permiso}</span></label></div>))}</div></div></div>))}</div></form>) : (<div className="alert alert-light-primary text-center py-5 border-0 rounded-4 shadow-sm"><i className="bi bi-shield-check fs-1 text-primary d-block mb-3"></i><h5 className="alert-heading fw-bold text-primary">Gestión de Accesos</h5><p className="mb-0 text-muted">Selecciona un Rol en el panel superior para visualizar y editar sus permisos por módulo.</p></div>)}</div></div></div>
      );
    }
    
    if (selected === 'Ejercicio fiscal y períodos') return <EjercicioFiscal idEmpresa={idMiEmpresa} mostrarToast={mostrarToast} />;
    if (selected === 'Catálogo de cuentas') return <CatalogoCuentas idEmpresa={idMiEmpresa} mostrarToast={mostrarToast} />;
    if (selected === 'Terceros y documentos fuente') return <TercerosDocumentos idEmpresa={idMiEmpresa} mostrarToast={mostrarToast} />;
    if (selected === 'Registro de pólizas') return <RegistroPolizas idEmpresa={idMiEmpresa} mostrarToast={mostrarToast} />;
    if (selected === 'Validaciones contables') return <ValidacionesContables idEmpresa={idMiEmpresa} mostrarToast={mostrarToast} />;
    if (selected === 'Cierre contable') return <CierreContable idEmpresa={idMiEmpresa} mostrarToast={mostrarToast} />;
    
    return <div className="mt-4 ms-3"><h4 className="text-muted">Módulo en construcción: {selected}</h4></div>;
  };

  return (
    <div className="container-fluid p-0 var-bg-light-gray min-vh-100 transition-colors">
      
      {toast.visible && (
        <div className={`toast-custom bg-${toast.tipo} text-white shadow-lg d-flex align-items-center`}>
          <i className={`bi ${toast.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-4 me-3`}></i>
          <span className="fw-medium">{toast.mensaje}</span>
        </div>
      )}

      <header className="navbar navbar-expand var-bg-white sticky-top px-4 py-2 modern-header transition-colors">
        <div className="container-fluid p-0">
          <a className="navbar-brand d-flex align-items-center fw-bold var-text-dark fs-4" href="#">
            <img src="/logo.png" alt="Logo" width="40" height="40" className="me-3 rounded-2" onError={(e) => e.target.style.display='none'} />
            <span>SIAC <span className="text-primary fw-medium small">/ Plataforma</span></span>
          </a>
          
          <div className="ms-auto d-flex align-items-center">
            <button className="btn btn-sm btn-light rounded-circle me-3 var-btn-light border-0" onClick={toggleDarkMode} style={{width: '35px', height: '35px'}} title="Alternar tema">
              <i className={`bi ${darkMode ? 'bi-moon-stars-fill text-warning' : 'bi-sun-fill text-warning'} fs-5`}></i>
            </button>

            <button className="btn btn-sm btn-outline-danger rounded-pill me-3 px-3 fw-bold" onClick={cerrarSesion} title="Cerrar sesión">
              <i className="bi bi-box-arrow-right me-2"></i>
              Cerrar sesión
            </button>

            <div className="d-flex align-items-center modern-user-panel var-bg-light rounded-pill px-2 py-1 border border-light-gray">
              <span className="text-muted small px-3 border-end border-light-gray me-2 fw-medium">{idMiEmpresa === 1 ? 'SIAC SaaS' : empresas[0]?.nombre_comercial || 'Empresa'}</span>
              <img src="/avatar.png" alt="U" width="35" height="35" className="rounded-circle border border-2 border-white shadow-sm" onError={(e) => e.target.src='https://via.placeholder.com/35?text=U'} />
              <div className="ms-2 pe-2">
                <strong className="var-text-dark d-block lh-1 fw-bold">@{nombreUsuarioLogueado}</strong>
                <span className="text-success small fw-bold text-uppercase" style={{fontSize: '0.65rem'}}><i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="row m-0">
        <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block var-bg-white sidebar collapse modern-sidebar transition-colors" style={{position: 'fixed', overflowY: 'auto'}}>
          <div className="position-sticky pt-3 px-3">
            <div className="d-flex align-items-center mb-4 px-2 pt-2 pb-3 border-bottom border-light-gray">
               <img src="/brand-icon.png" alt="" width="30" height="30" className="me-2" onError={(e) => e.target.style.display='none'} />
               <h5 className="mb-0 fw-bold var-text-dark">Contabilidad <span className="text-muted fw-normal">SaaS</span></h5>
            </div>
            <ul className="nav flex-column mt-2 g-2">
              <li className="nav-item mb-2 mt-1 px-1 pb-2 border-bottom border-light-gray">
                <a href="#" className={`nav-link fs-6 rounded-3 d-flex align-items-center ${selected === 'Dashboard Principal' ? 'active-modern' : 'text-secondary-modern'}`} onClick={() => setSelected('Dashboard Principal')}>
                  <i className={`bi ${iconosModulos['Dashboard Principal']} me-3 fs-5`}></i>Dashboard
                </a>
              </li>
              {modulosFiltrados.map((m) => {
                const abierto = !!modulosAbiertos[m.name];
                return (
                  <li key={m.name} className="nav-item mb-2 menu-group-card">
                    <button
                      type="button"
                      className={`menu-group-toggle w-100 ${abierto ? 'is-open' : ''}`}
                      onClick={() => toggleModuloMenu(m.name)}
                    >
                      <span className="d-flex align-items-center">
                        <i className={`bi ${iconosModulos[m.name] || 'bi-collection'} me-2`}></i>
                        {m.name}
                      </span>
                      <i className={`bi ${abierto ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </button>

                    {abierto && (
                      <div className="menu-group-content mt-1">
                        {m.children.map((c) => (
                          <a key={c} href="#" className={`nav-link py-2 ms-1 rounded-3 small d-flex align-items-center transition-all ${selected === c ? 'active-modern' : 'text-secondary-modern'}`} onClick={() => setSelected(c)}>
                            <i className={`bi ${iconosModulos[c] || 'bi-circle'} me-3`} style={{fontSize: selected === c ? '0.6rem' : '0.5rem', transition: 'all 0.2s'}}></i>{c}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content-modern pb-5">
          {renderContent()}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --bg-body: #F4F7FE;
          --bg-card: #FFFFFF;
          --text-main: #2B3674;
          --border-color: #E0E5F2;
          --bg-input: #FFFFFF;
          --bg-table-header: #F7F9FC;
          --bg-hover: #F4F7FE;
          --bg-light-btn: #f8f9fa;
        }

        .dark-theme {
          --bg-body: #0b0f19;
          --bg-card: #111827;
          --text-main: #e2e8f0;
          --border-color: #1e293b;
          --bg-input: #1e293b;
          --bg-table-header: #0f172a;
          --bg-hover: #1e293b;
          --bg-light-btn: #1e293b;
        }

        body { font-family: 'Inter', sans-serif; background-color: var(--bg-body); color: var(--text-main); }
        
        .var-bg-light-gray { background-color: var(--bg-body) !important; }
        .var-bg-white { background-color: var(--bg-card) !important; }
        .var-text-dark { color: var(--text-main) !important; }
        .border-light-gray { border-color: var(--border-color) !important; }
        .table-light-gray { background-color: var(--bg-table-header) !important; border-bottom: 1px solid var(--border-color); }
        .var-btn-light { background-color: var(--bg-light-btn); color: var(--text-main); }
        .var-bg-light { background-color: var(--bg-light-btn) !important; }

        .transition-colors { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }

        .modern-header { box-shadow: 0 4px 12px 0 rgba(0,0,0,0.03); z-index: 1030; border: none; }
        .modern-sidebar { height: calc(100vh - 73px); top: 73px; border-right: 1px solid var(--border-color); padding-bottom: 2rem; box-shadow: 4px 0 12px 0 rgba(0,0,0,0.01); }
        .modern-sidebar::-webkit-scrollbar { width: 5px; }
        .modern-sidebar::-webkit-scrollbar-thumb { background: var(--border-color); rounded: 5px; }
        .main-content-modern { padding-top: 1.5rem; }
        
        .modern-sidebar .nav-link { color: #A3AED0; font-weight: 500; transition: all 0.2s ease; border-left: 4px solid transparent; }
        .modern-sidebar .nav-link.text-secondary-modern:hover { color: var(--text-main); background-color: var(--bg-hover); transform: translateX(3px); }
        .modern-sidebar .nav-link.active-modern { color: var(--text-main); font-weight: 700; border-left: 4px solid #4318FF; background-color: rgba(67, 24, 255, 0.05); }
        .modern-sidebar .nav-link i { color: inherit; }
        .text-muted-modern { color: #A3AED0; }
        .menu-group-card { background: rgba(67, 24, 255, 0.03); border: 1px solid var(--border-color); border-radius: 14px; padding: 0.2rem; }
        .menu-group-toggle {
          border: none;
          background: transparent;
          color: #7f8db8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.9rem;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .menu-group-toggle:hover, .menu-group-toggle.is-open {
          background-color: rgba(67, 24, 255, 0.07);
          color: var(--text-main);
        }
        .menu-group-content {
          padding: 0.15rem 0.2rem 0.35rem;
          animation: fadeIn 0.2s ease-in;
        }
        
        .card { background-color: var(--bg-card); transition: background-color 0.3s ease; }
        .rounded-4 { border-radius: 1rem !important; }
        .shadow-sm { box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important; }
        .btn { border-radius: 0.75rem; padding: 0.6rem 1.5rem; transition: all 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .btn-sm { padding: 0.3rem 0.8rem; }
        .rounded-pill { border-radius: 50rem !important; }
        
        .form-control, .form-select { 
          border-radius: 0.75rem; border: 1px solid var(--border-color); padding: 0.75rem 1rem; 
          color: var(--text-main); font-weight: 500; background-color: var(--bg-input); transition: all 0.2s; 
        }
        .form-control:focus, .form-select:focus { border-color: #4318FF; box-shadow: 0 0 0 0.25rem rgba(67, 24, 255, 0.1); }
        .focus-none:focus { box-shadow: none !important; border-color: transparent !important; }
        .focus-primary:focus { border-color: #4318FF !important; box-shadow: 0 0 0 0.25rem rgba(67, 24, 255, 0.1) !important; }
        .focus-secondary:focus { border-color: #6c757d !important; box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.1) !important; }
        .focus-info:focus { border-color: #0dcaf0 !important; box-shadow: 0 0 0 0.25rem rgba(13, 202, 240, 0.1) !important; }
        
        .form-label { font-weight: 600; color: var(--text-main); margin-bottom: 0.3rem; }
        
        .modern-table thead th { border: none; padding-top: 1rem; padding-bottom: 1rem; color: #A3AED0; }
        .modern-table tbody tr { border-bottom: 1px solid var(--border-color); transition: all 0.2s; }
        .modern-table tbody tr:hover { background-color: var(--bg-hover) !important; }
        .modern-table tbody tr:last-child { border-bottom: none; }
        .modern-table tbody td { padding-top: 1rem; padding-bottom: 1rem; color: var(--text-main); }
        
        .badge.rounded-pill { padding: 0.4em 0.8em; font-weight: 600; font-size: 0.75em; border: 1px solid transparent; }
        .bg-light-success { background-color: rgba(5, 205, 153, 0.1) !important; color: #05CD99 !important; border-color: rgba(5, 205, 153, 0.2); }
        .bg-light-warning { background-color: rgba(255, 168, 0, 0.1) !important; color: #FFA800 !important; border-color: rgba(255, 168, 0, 0.2); }
        .bg-light-danger { background-color: rgba(238, 93, 80, 0.1) !important; color: #EE5D50 !important; border-color: rgba(238, 93, 80, 0.2); }
        .bg-light-info { background-color: rgba(0, 184, 217, 0.1) !important; color: #00B8D9 !important; border-color: rgba(0, 184, 217, 0.2); }
        .bg-light-primary { background-color: rgba(67, 24, 255, 0.1) !important; color: #4318FF !important; border-color: rgba(67, 24, 255, 0.2); }
        
        .icon-shape { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; }
        .bg-light-teal { background-color: rgba(0, 128, 128, 0.1); color: #008080; }
        .text-teal { color: #008080; }
        
        .sticky-top-custom { position: sticky; top: 100px; z-index: 10; }
        .action-btn { opacity: 0.7; transition: all 0.2s; }
        .modern-table tbody tr:hover .action-btn { opacity: 1; transform: scale(1.1); }
        
        .transition-hover { transition: all 0.3s ease; }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
        
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .toast-custom {
          position: fixed; bottom: 30px; right: 30px; min-width: 280px; padding: 15px 25px; border-radius: 12px; z-index: 9999;
          animation: slideInBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; box-shadow: 0 15px 35px rgba(0,0,0,0.2) !important;
        }
        @keyframes slideInBounce { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }

        .dark-theme .recharts-cartesian-grid-line { stroke: #3a3f58; }
        .dark-theme .recharts-text { fill: #A3AED0; }
        .dark-theme input { color: #fff !important; }
      `}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
    </div>
  );
}