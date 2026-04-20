import { useState } from 'react';
import Link from 'next/link';

const menuItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Planes y precios', href: '#planes' },
  { label: 'Productos', href: '#productos' },
  { label: 'Modulos', href: '#modulos' },
  { label: 'Por que SIAC', href: '#porque-siac' },
  { label: 'Recursos', href: '#recursos' },
];

const planCards = [
  {
    title: 'Plan Base',
    featured: true,
    description: 'Diseñado para equipos que necesitan empezar con orden, control y una curva de aprendizaje baja.',
    items: ['Acceso por roles', 'Catalogos esenciales', 'Panel inicial de trabajo'],
  },
  {
    title: 'Plan Escalable',
    description: 'Preparado para operaciones que requieren mas visibilidad, mas control y una estructura mas amplia.',
    items: ['Mas modulos operativos', 'Reportes y auditoria', 'Soporte para crecimiento por fases'],
  },
];

const productCards = [
  {
    title: 'Control de acceso',
    description: 'Usuarios, roles, permisos y trazabilidad visibles para una administracion confiable y facil de seguir.',
  },
  {
    title: 'Gestion contable',
    description: 'Un entorno pensado para trabajar catalogos, configuracion y procesos contables con menos friccion.',
  },
  {
    title: 'Visibilidad ejecutiva',
    description: 'Informacion presentada con prioridad visual para apoyar seguimiento, supervision y toma de decisiones.',
  },
];

const modules = [
  'Seguridad y acceso',
  'Configuracion empresarial',
  'Catalogos maestros',
  'Contabilidad general',
  'Reportes y trazabilidad',
  'Gestion multiempresa',
];

const whyItems = [
  {
    title: 'Jerarquia clara',
    description: 'La informacion se presenta en el orden correcto: orientacion, valor, comparacion y accion.',
  },
  {
    title: 'Navegacion comprensible',
    description: 'El usuario reconoce rapido donde esta, a donde puede ir y cual es el siguiente paso recomendado.',
  },
  {
    title: 'Diseno que acompaña el crecimiento',
    description: 'La experiencia mantiene consistencia visual mientras la plataforma suma nuevas funciones y modulos.',
  },
];

function SectionHeading({ label, title, dark = false }) {
  return (
    <div className={`section-heading${dark ? ' on-dark' : ''}`}>
      <span>{label}</span>
      <h2>{title}</h2>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <span>SIAC plataforma administrativa y contable</span>
        <a href="tel:+50251149061">Contacto: +502 51149061</a>
      </div>
    </header>
  );
}

function MainNav({ isOpen, onToggle, onClose }) {
  return (
    <nav className="main-nav">
      <div className="shell nav-inner">
        <a href="#inicio" className="brand" onClick={onClose}>
          <span className="brand-logo" aria-hidden="true">S</span>
          <span className="brand-wordmark">SIAC</span>
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={isOpen}
          aria-controls="main-menu"
          onClick={onToggle}
        >
          <span></span>
          <span></span>
          <span></span>
          Menu
        </button>

        <div id="main-menu" className={`nav-panel${isOpen ? ' is-open' : ''}`}>
          <div className="nav-links">
            {menuItems.map((item) => (
              <a key={item.label} href={item.href} onClick={onClose}>
                {item.label}
              </a>
            ))}
          </div>

          <Link href="/login" className="login-button" onClick={onClose}>
            Iniciar sesion
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="inicio" className="hero-section">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Experiencia clara desde el primer ingreso</span>
          <h1>La operacion contable debe sentirse simple, guiada y segura.</h1>
          <p className="hero-lead">
            SIAC organiza la informacion para que el usuario encuentre rapido lo que necesita,
            entienda donde esta y avance sin friccion entre seguridad, configuracion, modulos y control.
          </p>
          <div className="hero-notes" aria-label="Beneficios principales de SIAC">
            <span>Flujo claro para usuarios nuevos</span>
            <span>Navegacion directa en una sola pagina</span>
            <span>Base preparada para crecer por etapas</span>
          </div>

          <div className="hero-actions">
            <Link href="/login" className="primary-action shared-cta">
              Iniciar sesion
            </Link>
            <a href="#planes" className="secondary-action shared-cta">
              Ver planes
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="metric-card large">
            <span>Recorrido principal</span>
            <strong>Explora, compara e ingresa sin perder contexto</strong>
            <p>
              La portada orienta al usuario, presenta valor rapidamente y lo lleva a la accion correcta
              con menos carga visual y mejor comprension.
            </p>
          </div>
          <div className="metric-row">
            <div className="metric-card">
              <span>Enfoque UX/UI</span>
              <strong>Lectura guiada</strong>
            </div>
            <div className="metric-card">
              <span>Decision</span>
              <strong>CTA visibles</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section id="planes" className="content-section light">
      <div className="shell">
        <SectionHeading
          label="Planes y precios"
          title="Opciones entendibles para decidir rapido y avanzar con confianza."
        />

        <div className="card-grid two-up">
          {planCards.map((plan) => (
            <article key={plan.title} className={`info-card${plan.featured ? ' featured' : ''}`}>
              <h3>{plan.title}</h3>
              <p>{plan.description}</p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <section id="productos" className="content-section">
      <div className="shell">
        <SectionHeading
          label="Productos"
          title="Funciones agrupadas para que cada usuario entienda que puede hacer y donde hacerlo."
        />

        <div className="card-grid three-up">
          {productCards.map((product) => (
            <article key={product.title} className="info-card">
              <h3>{product.title}</h3>
              <p>{product.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section id="modulos" className="content-section dark-band">
      <div className="shell">
        <SectionHeading
          label="Modulos"
          title="Modulos ordenados para que la experiencia crezca sin volverse confusa."
          dark
        />

        <div className="module-grid">
          {modules.map((module) => (
            <article key={module} className="module-card">
              <span className="module-dot"></span>
              <h3>{module}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section id="porque-siac" className="content-section light">
      <div className="shell why-grid">
        <div>
          <SectionHeading
            label="Por que SIAC"
            title="Porque una buena experiencia reduce errores, acelera tareas y mejora adopcion."
          />
        </div>

        <div className="why-list">
          {whyItems.map((item) => (
            <article key={item.title} className="why-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourcesSection() {
  return (
    <section id="recursos" className="content-section resources-block">
      <div className="shell resources-inner">
        <SectionHeading
          label="Recursos"
          title="Esta seccion la seguimos editando despues."
        />
        <p>
          Por ahora queda reservada para documentacion, preguntas frecuentes, demostraciones y
          materiales comerciales.
        </p>
      </div>
    </section>
  );
}

export default function Web() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((current) => !current);

  return (
    <>
      <main className="siac-page">
        <TopBar />
        <MainNav isOpen={isMenuOpen} onToggle={toggleMenu} onClose={closeMenu} />
        <HeroSection />
        <PlansSection />
        <ProductsSection />
        <ModulesSection />
        <WhySection />
        <ResourcesSection />
      </main>

      <style jsx global>{`
        .siac-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #eef7ff 0%, #f7fbff 42%, #ffffff 100%);
          color: #17324d;
        }

        .shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .topbar {
          background: #1294e7;
          color: #ffffff;
        }

        .topbar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          min-height: 52px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .topbar a {
          color: #ffffff;
          text-decoration: none;
          white-space: nowrap;
        }

        .main-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(18, 148, 231, 0.12);
        }

        .nav-inner {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 1.5rem;
          min-height: 96px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          color: #1294e7;
          text-decoration: none;
          z-index: 3;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 16px;
          background: linear-gradient(135deg, #2ea4ef 0%, #0d78c8 100%);
          color: #ffffff;
          font-size: 1.95rem;
          font-weight: 800;
          line-height: 1;
          box-shadow: 0 12px 22px rgba(18, 148, 231, 0.18);
        }

        .brand-wordmark {
          color: #1f91de;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 2.15rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .menu-toggle {
          display: none;
          justify-self: end;
          align-items: center;
          gap: 0.45rem;
          background: transparent;
          border: 0;
          color: #1f4f78;
          font-size: 0.92rem;
          font-weight: 700;
          padding: 0.75rem 0;
          cursor: pointer;
          z-index: 3;
        }

        .menu-toggle span {
          width: 18px;
          height: 2px;
          display: block;
          background: #1f4f78;
          border-radius: 999px;
        }

        .nav-panel {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .nav-links a {
          color: #274c6b;
          text-decoration: none;
          font-size: 0.98rem;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .nav-links a:hover,
        .nav-links a:focus-visible {
          color: #1294e7;
        }

        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0.72rem 1.2rem;
          border-radius: 999px;
          border: 1px solid rgba(18, 148, 231, 0.2);
          background: linear-gradient(135deg, rgba(18, 148, 231, 0.14) 0%, rgba(255, 255, 255, 0.96) 100%);
          box-shadow: 0 12px 24px rgba(18, 148, 231, 0.12);
          color: #0f7fd2;
          text-decoration: none;
          font-size: 0.96rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .login-button:hover,
        .login-button:focus-visible {
          color: #095f9d;
          border-color: rgba(18, 148, 231, 0.38);
          background: linear-gradient(135deg, rgba(18, 148, 231, 0.2) 0%, #ffffff 100%);
          box-shadow: 0 16px 28px rgba(18, 148, 231, 0.16);
          transform: translateY(-1px);
        }

        .primary-action,
        .secondary-action,
        .shared-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 1.4rem;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 700;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .primary-action,
        .secondary-action,
        .shared-cta {
          border: 1px solid rgba(18, 148, 231, 0.24);
          color: #1294e7;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 10px 24px rgba(18, 148, 231, 0.08);
        }

        .primary-action:hover,
        .primary-action:focus-visible,
        .secondary-action:hover,
        .secondary-action:focus-visible,
        .shared-cta:hover,
        .shared-cta:focus-visible {
          color: #0d7fd1;
          border-color: rgba(18, 148, 231, 0.42);
          background: rgba(255, 255, 255, 0.96);
          transform: translateY(-1px);
        }

        .hero-section {
          position: relative;
          overflow: hidden;
          padding: 5.5rem 0 4rem;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 20%, rgba(18, 148, 231, 0.18), transparent 22%),
            radial-gradient(circle at 85% 10%, rgba(24, 88, 153, 0.12), transparent 20%);
          pointer-events: none;
        }

        .hero-grid {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
          gap: 2rem;
          align-items: center;
        }

        .eyebrow,
        .section-heading span {
          display: inline-flex;
          margin-bottom: 1rem;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: rgba(18, 148, 231, 0.12);
          color: #0d7fd1;
          font-size: 0.88rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .hero-copy h1 {
          max-width: 12ch;
          margin: 0 0 1.2rem;
          font-size: clamp(2.8rem, 6vw, 5.3rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .hero-copy p,
        .resources-inner p,
        .info-card p,
        .why-item p,
        .metric-card p {
          margin: 0;
          color: #486581;
          line-height: 1.75;
          font-size: 1.05rem;
        }

        .hero-lead {
          max-width: 56ch;
        }

        .hero-notes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.2rem;
        }

        .hero-notes span {
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          padding: 0 0.95rem;
          border-radius: 999px;
          background: rgba(18, 148, 231, 0.08);
          color: #35516b;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1.8rem;
        }

        .hero-panel {
          display: grid;
          gap: 1rem;
        }

        .metric-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .metric-card {
          padding: 1.4rem;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(18, 148, 231, 0.1);
          box-shadow: 0 24px 60px rgba(23, 50, 77, 0.08);
        }

        .metric-card.large {
          padding: 2rem;
        }

        .metric-card span {
          display: block;
          color: #5f7b96;
          font-size: 0.88rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .metric-card strong {
          display: block;
          margin: 0.45rem 0 0.8rem;
          font-size: 1.6rem;
          line-height: 1.1;
        }

        .content-section {
          padding: 5rem 0;
        }

        .content-section.light {
          background: rgba(18, 148, 231, 0.04);
        }

        .dark-band {
          background: linear-gradient(135deg, #0f2740 0%, #163c5f 100%);
          color: #ffffff;
        }

        .section-heading {
          margin-bottom: 2rem;
        }

        .section-heading h2 {
          margin: 0;
          max-width: 15ch;
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .on-dark span {
          background: rgba(255, 255, 255, 0.1);
          color: #8fd6ff;
        }

        .card-grid {
          display: grid;
          gap: 1.25rem;
        }

        .two-up {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .three-up {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .info-card,
        .why-item,
        .module-card,
        .resources-inner {
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(18, 148, 231, 0.1);
          padding: 1.6rem;
          box-shadow: 0 24px 60px rgba(23, 50, 77, 0.08);
        }

        .featured {
          background: linear-gradient(135deg, #1294e7 0%, #0d7fd1 100%);
          color: #ffffff;
        }

        .featured p,
        .featured li {
          color: rgba(255, 255, 255, 0.88);
        }

        .info-card h3,
        .why-item h3,
        .module-card h3 {
          margin: 0 0 0.75rem;
          font-size: 1.3rem;
          line-height: 1.2;
        }

        .info-card ul {
          margin: 1rem 0 0;
          padding-left: 1.2rem;
          color: #486581;
          line-height: 1.8;
        }

        .module-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .module-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: none;
        }

        .module-dot {
          width: 12px;
          height: 12px;
          display: inline-block;
          margin-bottom: 1rem;
          border-radius: 999px;
          background: #54c2ff;
          box-shadow: 0 0 0 8px rgba(84, 194, 255, 0.14);
        }

        .why-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 1.5rem;
          align-items: start;
        }

        .why-list {
          display: grid;
          gap: 1rem;
        }

        .resources-block {
          padding-bottom: 6rem;
        }

        @media (max-width: 1080px) {
          .hero-grid,
          .why-grid,
          .two-up,
          .three-up,
          .module-grid {
            grid-template-columns: 1fr;
          }

          .hero-copy h1,
          .section-heading h2 {
            max-width: none;
          }
        }

        @media (max-width: 960px) {
          .nav-inner {
            grid-template-columns: auto auto;
            justify-content: space-between;
            gap: 1rem;
            min-height: 88px;
            padding: 0.6rem 0;
          }

          .menu-toggle {
            display: inline-flex;
          }

          .nav-panel {
            grid-column: 1 / -1;
            display: none;
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 0.5rem 0 1rem;
            border-top: 1px solid rgba(18, 148, 231, 0.12);
          }

          .nav-panel.is-open {
            display: grid;
          }

          .nav-links {
            align-items: flex-start;
            justify-content: flex-start;
            flex-direction: column;
            gap: 0.9rem;
          }

          .login-button {
            justify-self: start;
          }

          .brand-wordmark {
            font-size: 1.95rem;
          }
        }

        @media (max-width: 720px) {
          .shell {
            width: min(100% - 24px, 1180px);
          }

          .topbar-inner {
            flex-direction: column;
            justify-content: center;
            padding: 0.75rem 0;
            text-align: center;
          }

          .hero-section {
            padding-top: 3.5rem;
          }

          .hero-copy h1 {
            font-size: clamp(2.2rem, 10vw, 3.3rem);
          }

          .metric-row {
            grid-template-columns: 1fr;
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .primary-action,
          .secondary-action,
          .shared-cta {
            width: 100%;
          }

          .content-section {
            padding: 4rem 0;
          }
        }

        @media (max-width: 520px) {
          .brand-logo {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            font-size: 1.6rem;
          }

          .brand-wordmark {
            font-size: 1.65rem;
          }

          .hero-notes {
            flex-direction: column;
          }

          .hero-notes span {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .info-card,
          .why-item,
          .module-card,
          .resources-inner,
          .metric-card {
            padding: 1.2rem;
          }
        }
      `}</style>
    </>
  );
}