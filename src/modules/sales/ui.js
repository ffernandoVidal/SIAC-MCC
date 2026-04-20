import Link from 'next/link';

export function SalesShell({ eyebrow, title, description, children }) {
  return (
    <div className="sales-shell">
      <div className="sales-shell__backdrop" />
      <div className="container py-5 position-relative">
        <header className="sales-hero mb-4 mb-lg-5">
          <div>
            <span className="sales-eyebrow">{eyebrow}</span>
            <h1 className="sales-title mt-3">{title}</h1>
            <p className="sales-description mb-0">{description}</p>
          </div>
          <Link href="/dashboard" className="sales-return">
            <i className="bi bi-arrow-left-short" />
            Volver al panel
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

export function SummaryCard({ title, value, detail, icon, tone = 'primary' }) {
  return (
    <div className="sales-card sales-card--stat h-100">
      <div className={`sales-icon sales-icon--${tone}`}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <p className="sales-label mb-2">{title}</p>
        <h3 className="sales-value mb-1">{value}</h3>
        <p className="sales-muted mb-0">{detail}</p>
      </div>
    </div>
  );
}

export function SectionCard({ title, description, action, children }) {
  return (
    <section className="sales-card h-100">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="sales-section-title mb-1">{title}</h2>
          {description ? <p className="sales-muted mb-0">{description}</p> : null}
        </div>
        {action || null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="sales-empty-state">
      <div className="sales-empty-state__icon">
        <i className={`bi ${icon}`} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function Currency(value) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(value);
}