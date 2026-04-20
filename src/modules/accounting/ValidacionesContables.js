import { useState, useEffect } from 'react';

export default function ValidacionesContables({ idEmpresa, mostrarToast }) {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioSel, setEjercicioSel] = useState('');
  const [validaciones, setValidaciones] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/ejercicios?id_empresa=${idEmpresa}`);
      const data = await res.json();
      if (data.success) setEjercicios(data.data);
    })();
  }, []);

  const ejecutarValidaciones = async () => {
    if (!ejercicioSel) return mostrarToast('Selecciona un ejercicio', 'warning');
    setCargando(true);
    try {
      const [resLibro, resMayor] = await Promise.all([
        fetch(`/api/libro-diario?id_ejercicio=${ejercicioSel}`),
        fetch(`/api/mayor-general?id_ejercicio=${ejercicioSel}`)
      ]);
      const [dataLibro, dataMayor] = await Promise.all([resLibro.json(), resMayor.json()]);

      const asientos = dataLibro.success ? dataLibro.data : [];
      const cuentasMayor = dataMayor.success ? dataMayor.data : [];

      // Validaciones
      const polizasSinCuadrar = [];
      const grupoPoliza = {};
      asientos.forEach(a => {
        if (!grupoPoliza[a.numero_poliza]) grupoPoliza[a.numero_poliza] = { debe: 0, haber: 0, concepto: a.concepto_poliza, fecha: a.fecha_poliza };
        grupoPoliza[a.numero_poliza].debe += parseFloat(a.debito) || 0;
        grupoPoliza[a.numero_poliza].haber += parseFloat(a.credito) || 0;
      });
      Object.entries(grupoPoliza).forEach(([num, val]) => {
        if (Math.abs(val.debe - val.haber) > 0.01) polizasSinCuadrar.push({ numero: num, ...val, diferencia: val.debe - val.haber });
      });

      const totalDebe = cuentasMayor.reduce((s, c) => s + (parseFloat(c.total_debito) || 0), 0);
      const totalHaber = cuentasMayor.reduce((s, c) => s + (parseFloat(c.total_credito) || 0), 0);
      const balanceGeneral = Math.abs(totalDebe - totalHaber) < 0.01;

      const cuentasSinMovimiento = cuentasMayor.filter(c => parseFloat(c.total_debito) === 0 && parseFloat(c.total_credito) === 0);

      setValidaciones({
        totalAsientos: asientos.length,
        totalPolizas: Object.keys(grupoPoliza).length,
        polizasSinCuadrar,
        totalDebe,
        totalHaber,
        balanceGeneral,
        cuentasMayor,
        cuentasSinMovimiento,
        diferencia: totalDebe - totalHaber
      });
    } catch { mostrarToast('Error al ejecutar validaciones', 'danger'); }
    setCargando(false);
  };

  const fmtMonto = (m) => `Q ${parseFloat(m || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

  return (
    <div className="container-fluid mt-4 px-3 fade-in">
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-header var-bg-white border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold var-text-dark"><i className="bi bi-patch-check me-2"></i>Validaciones Contables</h6>
            <p className="text-muted small mb-0">Verificación de integridad y balance de la contabilidad</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <select className="form-select form-select-sm rounded-pill" style={{ maxWidth: '160px' }} value={ejercicioSel} onChange={e => setEjercicioSel(e.target.value)}>
              <option value="">Ejercicio fiscal</option>
              {ejercicios.map(ej => <option key={ej.id_ejercicio} value={ej.id_ejercicio}>Año {ej.anio}</option>)}
            </select>
            <button className="btn btn-primary rounded-pill fw-bold px-3" disabled={cargando} onClick={ejecutarValidaciones}>
              {cargando ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</> : <><i className="bi bi-play-fill me-1"></i>Ejecutar validaciones</>}
            </button>
          </div>
        </div>
      </div>

      {!validaciones && !cargando && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-check fs-1 d-block mb-3"></i>
          <p>Selecciona un ejercicio fiscal y ejecuta las validaciones para revisar la integridad contable.</p>
        </div>
      )}

      {validaciones && (
        <>
          {/* KPIs */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0 rounded-4 p-3 text-center">
                <div className="text-muted small fw-medium">Pólizas evaluadas</div>
                <div className="fs-3 fw-bold text-primary">{validaciones.totalPolizas}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 rounded-4 p-3 text-center">
                <div className="text-muted small fw-medium">Asientos contables</div>
                <div className="fs-3 fw-bold text-info">{validaciones.totalAsientos}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card shadow-sm border-0 rounded-4 p-3 text-center ${validaciones.polizasSinCuadrar.length === 0 ? '' : 'border border-danger'}`}>
                <div className="text-muted small fw-medium">Pólizas sin cuadrar</div>
                <div className={`fs-3 fw-bold ${validaciones.polizasSinCuadrar.length === 0 ? 'text-success' : 'text-danger'}`}>
                  {validaciones.polizasSinCuadrar.length === 0 ? <><i className="bi bi-check-circle-fill"></i> 0</> : validaciones.polizasSinCuadrar.length}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card shadow-sm border-0 rounded-4 p-3 text-center ${validaciones.balanceGeneral ? '' : 'border border-danger'}`}>
                <div className="text-muted small fw-medium">Balance General</div>
                <div className={`fs-3 fw-bold ${validaciones.balanceGeneral ? 'text-success' : 'text-danger'}`}>
                  {validaciones.balanceGeneral ? <><i className="bi bi-check-circle-fill"></i> OK</> : <><i className="bi bi-x-circle-fill"></i> Error</>}
                </div>
              </div>
            </div>
          </div>

          {/* Totales debe/haber */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold var-text-dark mb-3"><i className="bi bi-calculator me-2"></i>Balance de Comprobación</h6>
              <div className="row">
                <div className="col-md-4"><div className="bg-light rounded-3 p-3 text-center"><div className="text-muted small">Total Débitos</div><div className="fs-5 fw-bold text-success">{fmtMonto(validaciones.totalDebe)}</div></div></div>
                <div className="col-md-4"><div className="bg-light rounded-3 p-3 text-center"><div className="text-muted small">Total Créditos</div><div className="fs-5 fw-bold text-danger">{fmtMonto(validaciones.totalHaber)}</div></div></div>
                <div className="col-md-4"><div className={`rounded-3 p-3 text-center ${validaciones.balanceGeneral ? 'bg-light-success' : 'bg-light-danger'}`}><div className="text-muted small">Diferencia</div><div className={`fs-5 fw-bold ${validaciones.balanceGeneral ? 'text-success' : 'text-danger'}`}>{fmtMonto(validaciones.diferencia)}</div></div></div>
              </div>
            </div>
          </div>

          {/* Pólizas con error */}
          {validaciones.polizasSinCuadrar.length > 0 && (
            <div className="card shadow-sm border-0 rounded-4 mb-4 border border-danger">
              <div className="card-header bg-light-danger text-danger border-0 pt-3 pb-2 px-4">
                <h6 className="mb-0 fw-bold"><i className="bi bi-exclamation-triangle me-2"></i>Pólizas que no cuadran ({validaciones.polizasSinCuadrar.length})</h6>
              </div>
              <div className="card-body p-0">
                <table className="table table-borderless mb-0 modern-table">
                  <thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">No. Póliza</th><th>Concepto</th><th className="text-end">Debe</th><th className="text-end">Haber</th><th className="text-end">Diferencia</th></tr></thead>
                  <tbody>
                    {validaciones.polizasSinCuadrar.map(p => (
                      <tr key={p.numero}><td className="px-4 fw-bold text-primary">{p.numero}</td><td>{p.concepto}</td><td className="text-end">{fmtMonto(p.debe)}</td><td className="text-end">{fmtMonto(p.haber)}</td><td className="text-end fw-bold text-danger">{fmtMonto(p.diferencia)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mayor General resumen */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header var-bg-white border-0 pt-3 pb-2 px-4">
              <h6 className="mb-0 fw-bold var-text-dark"><i className="bi bi-journal-text me-2"></i>Mayor General — Resumen ({validaciones.cuentasMayor.length} cuentas)</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-borderless mb-0 align-middle modern-table">
                  <thead className="table-light-gray text-muted small text-uppercase"><tr><th className="px-4">Código</th><th>Cuenta</th><th>Naturaleza</th><th className="text-end">Débitos</th><th className="text-end">Créditos</th><th className="text-end">Saldo</th></tr></thead>
                  <tbody>
                    {validaciones.cuentasMayor.map(c => (
                      <tr key={c.id_cuenta}>
                        <td className="px-4"><code className="text-primary fw-bold">{c.codigo_cuenta}</code></td>
                        <td className="fw-medium var-text-dark">{c.nombre_cuenta}</td>
                        <td><span className={`badge rounded-pill ${c.naturaleza === 'DEUDORA' ? 'bg-light-info text-info' : 'bg-light-warning text-warning'}`}>{c.naturaleza}</span></td>
                        <td className="text-end">{fmtMonto(c.total_debito)}</td>
                        <td className="text-end">{fmtMonto(c.total_credito)}</td>
                        <td className={`text-end fw-bold ${parseFloat(c.saldo) >= 0 ? 'text-success' : 'text-danger'}`}>{fmtMonto(c.saldo)}</td>
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
  );
}
