import { useState, useEffect } from 'react';

const modules = [
  {
    name: 'Seguridad y acceso',
    phase: 1,
    children: ['Usuarios', 'Roles', 'Permisos', 'Bitácora'],
  },
  {
    name: 'Configuración de empresa',
    phase: 1,
    children: ['Datos empresa', 'Moneda', 'Zona horaria', 'Reglas'],
  },
  {
    name: 'Catálogos maestros',
    phase: 1,
    children: ['Tipos de cuenta', 'Tipos de póliza', 'Estados', 'Documentos'],
  },
  {
    name: 'Ejercicio fiscal y períodos',
    phase: 2,
    children: [],
  },
  { name: 'Catálogo de cuentas', phase: 2, children: [] },
  { name: 'Terceros y documentos fuente', phase: 2, children: [] },
  { name: 'Registro de pólizas', phase: 3, children: [] },
  { name: 'Validaciones contables', phase: 3, children: [] },
  { name: 'Cierre contable', phase: 4, children: [] },
  { name: 'Auditoría completa', phase: 4, children: [] },
  { name: 'Consultas y reportes base', phase: 4, children: [] },
];

const phaseLabels = {
  1: 'Base técnica y seguridad',
  2: 'Núcleo contable',
  3: 'Operación contable',
  4: 'Cierres y reportes',
};

export default function Home() {
  const [selected, setSelected] = useState('Dashboard');
  const [dbConnected, setDbConnected] = useState(false); // pretend disconnected

  useEffect(() => {
    // here you would ping backend to update dbConnected
  }, []);

  const renderContent = () => {
    if (selected === 'Dashboard') {
      return (
        <>
          <h2>Dashboard</h2>
          <p>Bienvenido a SIAC, seleccione un módulo en el menú izquierdo.</p>
        </>
      );
    }
    return <h2>{selected}</h2>;
  };

  return (
    <div className="container-fluid">
      {/* top navbar */}
      <header className="navbar navbar-expand navbar-light bg-white border-bottom fixed-top">
        <div className="container-fluid">
          <button className="btn btn-link d-md-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <form className="d-flex mx-auto" style={{maxWidth: '400px'}}>
            <input className="form-control" type="search" placeholder="Buscar..." aria-label="Search" />
          </form>
          <div className="d-flex align-items-center">
            <button className="btn btn-primary me-2">+</button>
            <button className="btn btn-link"><i className="bi bi-bell"></i></button>
            <div className="dropdown">
              <a className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="/avatar.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                <strong>Admin</strong>
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li><a className="dropdown-item" href="#">Sign out</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      <div className="row">
        {/* Sidebar */}
        <nav id="sidebar" className="col-md-2 bg-light sidebar offcanvas-md offcanvas-start" tabIndex="-1">
          <div className="pt-3">
            <h5 className="px-3">SIAC</h5>
            <div className="px-3 mb-3">
              <span>DB status: </span>
              <span
                className={`badge ${dbConnected ? 'bg-success' : 'bg-danger'}`}
              >
                {dbConnected ? 'Conectada' : 'Desconectada'}
              </span>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <a
                  href="#"
                  className={`nav-link ${selected === 'Dashboard' ? 'active' : ''}`}
                  onClick={() => setSelected('Dashboard')}
                >
                  Dashboard
                </a>
              </li>
              {[1, 2, 3, 4].map((phase) => (
                <li key={phase} className="nav-item">
                  <a
                    href="#"
                    className="nav-link fw-bold"
                    data-bs-toggle="collapse"
                    data-bs-target={`#phase-${phase}`}
                    aria-expanded="false"
                  >
                    Fase {phase}: {phaseLabels[phase]}
                  </a>
                  <ul className="nav flex-column collapse" id={`phase-${phase}`}>
                    {modules
                      .filter((m) => m.phase === phase)
                      .map((m) => (
                        <li key={m.name} className="nav-item ms-3">
                          <a
                            href="#"
                            className={`nav-link ${selected === m.name ? 'active' : ''}`}
                            onClick={() => setSelected(m.name)}
                          >
                            {m.name}
                          </a>
                          {m.children.length > 0 && (
                            <ul className="nav flex-column ms-3">
                              {m.children.map((c) => (
                                <li key={c} className="nav-item">
                                  <a
                                    href="#"
                                    className={`nav-link ${selected === c ? 'active' : ''}`}
                                    onClick={() => setSelected(c)}
                                  >
                                    {c}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
              <li className="nav-item mt-3">
                <a
                  href="#"
                  className={`nav-link ${selected === 'Configuración' ? 'active' : ''}`}
                  onClick={() => setSelected('Configuración')}
                >
                  Configuración
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
          <div className="pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">{selected}</h1>
          </div>
          {renderContent()}
        </main>
      </div>

      <style jsx>{`
        .sidebar {
          height: 100vh;
          position: fixed;
          top: 56px; /* below fixed header */
          left: 0;
          padding-top: 1rem;
          border-right: 1px solid #dee2e6;
          background-color: #f8f9fa;
          overflow-y: auto;
        }
        .navbar {
          padding: 0.5rem 1rem;
        }
        .sidebar .nav-link {
          color: #333;
        }
        .sidebar .nav-link.active,
        .sidebar .nav-link:hover {
          color: #0d6efd;
        }
        .main-content {
          margin-top: 1rem;
        }
        .card {
          border-radius: 0.75rem;
        }
        .table {
          background-color: #fff;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
