const { query } = require('../../../config/db');

async function obtenerMayorGeneral({ idEmpresa, idPeriodo, idTipoCuenta, codigoCuenta }) {
  const condiciones = ['p.id_empresa = $1', "ep.codigo = 'APROBADA'", 'p.id_periodo = $2'];
  const parametros = [idEmpresa, idPeriodo];

  if (idTipoCuenta) {
    parametros.push(idTipoCuenta);
    condiciones.push(`cc.id_tipo_cuenta = $${parametros.length}`);
  }

  if (codigoCuenta) {
    parametros.push(`${codigoCuenta}%`);
    condiciones.push(`cc.codigo_cuenta LIKE $${parametros.length}`);
  }

  // Condiciones para el LEFT JOIN (excluir la primera: cc.id_empresa)
  const condicionesPoliza = condiciones.slice(0).join(' AND ');

  const resultado = await query(
    `SELECT cc.id_cuenta, cc.codigo_cuenta, cc.nombre_cuenta, cc.naturaleza,
            tc.nombre AS tipo_cuenta,
            COALESCE(SUM(dp.debito), 0) AS total_debito,
            COALESCE(SUM(dp.credito), 0) AS total_credito,
            CASE
              WHEN cc.naturaleza = 'DEUDORA'
                THEN COALESCE(SUM(dp.debito), 0) - COALESCE(SUM(dp.credito), 0)
              ELSE COALESCE(SUM(dp.credito), 0) - COALESCE(SUM(dp.debito), 0)
            END AS saldo
     FROM scc.catalogo_cuenta cc
     JOIN scc.tipo_cuenta tc ON tc.id_tipo_cuenta = cc.id_tipo_cuenta
     LEFT JOIN scc.detalle_poliza dp ON dp.id_cuenta = cc.id_cuenta
     LEFT JOIN scc.poliza p ON p.id_poliza = dp.id_poliza
     LEFT JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     WHERE cc.id_empresa = $1
       AND cc.acepta_movimientos = true
       AND (dp.id_poliza IS NULL OR (${condicionesPoliza}))
     GROUP BY cc.id_cuenta, cc.codigo_cuenta, cc.nombre_cuenta, cc.naturaleza, tc.nombre
     HAVING COALESCE(SUM(dp.debito), 0) > 0 OR COALESCE(SUM(dp.credito), 0) > 0
     ORDER BY cc.codigo_cuenta`,
    parametros
  );

  return resultado.rows;
}

async function obtenerMovimientosCuenta({ idEmpresa, idCuenta, idPeriodo, paginacion }) {
  const parametros = [idEmpresa, idCuenta, idPeriodo];

  const totalResultado = await query(
    `SELECT COUNT(*) AS total
     FROM scc.detalle_poliza dp
     JOIN scc.poliza p ON p.id_poliza = dp.id_poliza
     JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     WHERE p.id_empresa = $1
       AND dp.id_cuenta = $2
       AND p.id_periodo = $3
       AND ep.codigo = 'APROBADA'`,
    parametros
  );
  const total = Number(totalResultado.rows[0]?.total || 0);

  parametros.push(paginacion.limit, paginacion.offset);

  const resultado = await query(
    `SELECT dp.linea, dp.descripcion, dp.debito, dp.credito,
            dp.referencia_detalle,
            p.id_poliza, p.numero_poliza, p.fecha_poliza, p.concepto,
            tp.nombre AS tipo_poliza,
            t.nombre_razon_social AS tercero,
            SUM(dp.debito - dp.credito) OVER (
              PARTITION BY dp.id_cuenta
              ORDER BY p.fecha_poliza, p.numero_poliza, dp.linea
            ) AS saldo_acumulado
     FROM scc.detalle_poliza dp
     JOIN scc.poliza p ON p.id_poliza = dp.id_poliza
     JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
     LEFT JOIN scc.tercero t ON t.id_tercero = dp.id_tercero
     WHERE p.id_empresa = $1
       AND dp.id_cuenta = $2
       AND p.id_periodo = $3
       AND ep.codigo = 'APROBADA'
     ORDER BY p.fecha_poliza, p.numero_poliza, dp.linea
     LIMIT $4 OFFSET $5`,
    parametros
  );

  return { filas: resultado.rows, total };
}

module.exports = { obtenerMayorGeneral, obtenerMovimientosCuenta };
