import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [recordarme, setRecordarme] = useState(true);
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');
    document.cookie = 'siac_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    const correoNormalizado = correo.trim();
    const contrasenaNormalizada = contrasena.trim();

    if (!correoNormalizado || !contrasenaNormalizada) {
      setError('Ingresa tu usuario o correo y tu contraseña.');
      setCargando(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correoNormalizado, contrasena: contrasenaNormalizada })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario || { nombre: 'Usuario' }));
        localStorage.setItem('permisos', JSON.stringify(data.permisos || []));
        document.cookie = 'siac_auth=1; path=/; SameSite=Lax';
        router.push('/dashboard');
      } else {
        document.cookie = 'siac_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('permisos');
        setError(data.message || 'No fue posible iniciar sesion.');
      }
    } catch {
      document.cookie = 'siac_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      setError('No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <main className="login-page">
        <section className="login-shell">
          <div className="device-frame">
            <div className="brand-top">
              <Link href="/web" className="brand-block">
                <span className="brand-logo">S</span>
                <span className="brand-wordmark">SIAC</span>
              </Link>
            </div>

            <div className="login-card">
              <div className="card-header">
                <h1>
                  Bienvenido a
                  <br />
                  SIAC iniciar sesion
                </h1>
              </div>

              <form onSubmit={manejarLogin} className="login-form">
                <label className="field">
                  <span>Correo o usuario</span>
                  <input
                    type="text"
                    placeholder="usuario@empresa.com o nombre_usuario"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>

                <label className="field">
                  <span>Password</span>
                  <div className="password-wrap">
                    <input
                      type={mostrarContrasena ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setMostrarContrasena((actual) => !actual)}
                      aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarContrasena ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </label>

                <div className="form-row">
                  <label className="remember-box">
                    <input
                      type="checkbox"
                      checked={recordarme}
                      onChange={(e) => setRecordarme(e.target.checked)}
                    />
                    <span>Recordarme</span>
                  </label>
                  <button type="button" className="helper-link">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error ? <div className="error-box">{error}</div> : null}

                <button type="submit" className="submit-button" disabled={cargando}>
                  {cargando ? 'Validando acceso...' : 'Login'}
                </button>
              </form>

              <Link href="/web" className="back-link mobile-link">
                Volver al sitio principal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px 16px;
          background:
            radial-gradient(circle at top left, rgba(18, 148, 231, 0.2), transparent 28%),
            radial-gradient(circle at bottom right, rgba(12, 84, 145, 0.16), transparent 32%),
            linear-gradient(180deg, #eef7ff 0%, #f8fbff 48%, #ffffff 100%);
          color: #17324d;
        }

        .login-shell {
          width: min(1120px, 100%);
          display: flex;
          justify-content: center;
        }

        .device-frame {
          width: min(100%, 430px);
          padding: 30px 22px 26px;
          border-radius: 42px;
          background: rgba(246, 248, 255, 0.88);
          border: 1px solid rgba(18, 148, 231, 0.1);
          box-shadow: 0 28px 70px rgba(23, 50, 77, 0.14);
        }

        .brand-top {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .brand-block {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          text-decoration: none;
        }

        .brand-logo {
          width: 52px;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: linear-gradient(135deg, #2ea4ef 0%, #0d78c8 100%);
          color: #ffffff;
          font-size: 1.8rem;
          font-weight: 800;
          box-shadow: 0 12px 22px rgba(18, 148, 231, 0.18);
        }

        .brand-wordmark {
          color: #1f91de;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .login-card {
          border-radius: 32px;
          background: #ffffff;
          padding: 30px 18px 20px;
          border: 1px solid rgba(18, 148, 231, 0.08);
          box-shadow: 0 18px 46px rgba(23, 50, 77, 0.08);
        }

        .card-header h1 {
          margin: 0;
          text-align: center;
          line-height: 1.02;
          letter-spacing: -0.04em;
          font-size: clamp(2rem, 5vw, 2.6rem);
        }

        .login-form {
          display: grid;
          gap: 1rem;
          margin-top: 1.8rem;
        }

        .field {
          display: grid;
          gap: 0.45rem;
        }

        .field span {
          color: #324f6b;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .field input {
          width: 100%;
          min-height: 54px;
          padding: 0 1rem;
          border-radius: 999px;
          border: 1px solid rgba(39, 76, 107, 0.1);
          background: #f2f5fb;
          color: #17324d;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .field input:focus {
          border-color: rgba(18, 148, 231, 0.6);
          box-shadow: 0 0 0 4px rgba(18, 148, 231, 0.12);
          background: #ffffff;
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap input {
          padding-right: 74px;
        }

        .toggle-password {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #0d7fd1;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .remember-box {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #95a3b5;
          font-size: 0.92rem;
        }

        .remember-box input {
          accent-color: #1294e7;
        }

        .helper-link,
        .back-link {
          border: 0;
          background: transparent;
          color: #3b7fe5;
          font-size: 0.92rem;
          text-decoration: none;
          cursor: pointer;
        }

        .helper-link {
          padding: 0;
        }

        .error-box {
          border-radius: 18px;
          padding: 0.9rem 1rem;
          background: rgba(216, 62, 62, 0.08);
          border: 1px solid rgba(216, 62, 62, 0.16);
          color: #a12828;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .submit-button {
          min-height: 56px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, #1294e7 0%, #0d7fd1 100%);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 18px 34px rgba(18, 148, 231, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .submit-button:hover,
        .submit-button:focus-visible {
          transform: translateY(-1px);
          box-shadow: 0 22px 38px rgba(18, 148, 231, 0.24);
        }

        .submit-button:disabled {
          cursor: wait;
          opacity: 0.82;
        }

        .mobile-link {
          display: flex;
          justify-content: center;
          margin-top: 1.25rem;
        }

        @media (min-width: 900px) {
          .device-frame {
            width: min(100%, 980px);
            display: grid;
            grid-template-columns: minmax(320px, 0.85fr) minmax(420px, 0.95fr);
            gap: 28px;
            padding: 30px;
            align-items: center;
          }

          .brand-top {
            margin: 0;
            min-height: 100%;
            align-items: center;
          }

          .brand-block {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .brand-logo {
            width: 68px;
            height: 68px;
            font-size: 2rem;
          }

          .brand-wordmark {
            font-size: 3rem;
          }

          .brand-top::after {
            content: 'Acceso claro y rapido a tu entorno SIAC';
            display: block;
            margin-top: 1.25rem;
            max-width: 14ch;
            color: #35516b;
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 0.95;
            letter-spacing: -0.04em;
          }
        }

        @media (max-width: 640px) {
          .login-page {
            padding: 18px 12px;
          }

          .brand-wordmark {
            font-size: 1.8rem;
          }

          .brand-logo {
            width: 52px;
            height: 52px;
            font-size: 1.7rem;
          }

          .form-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .mobile-link {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
}