const { query } = require('../../../config/db');

async function obtenerLibroDiario({ idEmpresa, idPeriodo, idTipoPoliza, fechaDesde, fechaHasta, idCuenta, paginacion }) {
  const condiciones = ['p.id_empresa = $1', "ep.codigo = 'APROBADA'", 'p.id_periodo = $2'];
  const parametros = [idEmpresa, idPeriodo];

  if (idTipoPoliza) {
    parametros.push(idTipoPoliza);
    condiciones.push(`p.id_tipo_poliza = $${parametros.length}`);
  }

  if (fechaDesde) {
    parametros.push(fechaDesde);
    condiciones.push(`p.fecha_poliza >= $${parametros.length}`);
  }

  if (fechaHasta) {
    parametros.push(fechaHasta);
    condiciones.push(`p.fecha_poliza <= $${parametros.length}`);
  }

  if (idCuenta) {
    parametros.push(idCuenta);
    condiciones.push(`dp.id_cuenta = $${parametros.length}`);
  }

  const clausulaWhere = condiciones.join(' AND ');

  // COUNT para paginación
  let total = 0;
  if (paginacion) {
    const totalResultado = await query(
      `SELECT COUNT(*) AS total
       FROM scc.poliza p
       JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
       JOIN scc.detalle_poliza dp ON dp.id_poliza = p.id_poliza
       WHERE ${clausulaWhere}`,
      parametros
    );
    total = Number(totalResultado.rows[0]?.total || 0);
  }

  let clausulaLimit = '';
  const parametrosConsulta = [...parametros];
  if (paginacion) {
    parametrosConsulta.push(paginacion.limit, paginacion.offset);
    clausulaLimit = `LIMIT $${parametrosConsulta.length - 1} OFFSET $${parametrosConsulta.length}`;
  }

  const resultado = await query(
    `SELECT p.id_poliza, p.numero_poliza, p.fecha_poliza, p.concepto,
            tp.codigo AS codigo_tipo_poliza, tp.nombre AS tipo_poliza,
            dp.linea, dp.id_cuenta, cc.codigo_cuenta, cc.nombre_cuenta,
            dp.descripcion, dp.debito, dp.credito,
            dp.referencia_detalle,
            t.nombre_razon_social AS tercero
     FROM scc.poliza p
     JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
     JOIN scc.detalle_poliza dp ON dp.id_poliza = p.id_poliza
     JOIN scc.catalogo_cuenta cc ON cc.id_cuenta = dp.id_cuenta
     LEFT JOIN scc.tercero t ON t.id_tercero = dp.id_tercero
     WHERE ${clausulaWhere}
     ORDER BY p.fecha_poliza, p.numero_poliza, dp.linea
     ${clausulaLimit}`,
    parametrosConsulta
  );

  return { filas: resultado.rows, total };
}

module.exports = { obtenerLibroDiario };
