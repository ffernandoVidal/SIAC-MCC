const { query } = require('../../../config/db');

async function buscarPolizasPorEmpresa({ idEmpresa, filtros, paginacion }) {
  const condiciones = ['p.id_empresa = $1'];
  const parametros = [idEmpresa];

  if (filtros.id_periodo) {
    parametros.push(filtros.id_periodo);
    condiciones.push(`p.id_periodo = $${parametros.length}`);
  }

  if (filtros.id_tipo_poliza) {
    parametros.push(filtros.id_tipo_poliza);
    condiciones.push(`p.id_tipo_poliza = $${parametros.length}`);
  }

  if (filtros.estado) {
    parametros.push(filtros.estado);
    condiciones.push(`ep.codigo = $${parametros.length}`);
  }

  if (filtros.fecha_desde) {
    parametros.push(filtros.fecha_desde);
    condiciones.push(`p.fecha_poliza >= $${parametros.length}`);
  }

  if (filtros.fecha_hasta) {
    parametros.push(filtros.fecha_hasta);
    condiciones.push(`p.fecha_poliza <= $${parametros.length}`);
  }

  if (filtros.numero_poliza) {
    parametros.push(`%${filtros.numero_poliza}%`);
    condiciones.push(`p.numero_poliza ILIKE $${parametros.length}`);
  }

  const clausulaWhere = condiciones.join(' AND ');

  const totalResultado = await query(
    `SELECT COUNT(*) AS total
     FROM scc.poliza p
     JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     WHERE ${clausulaWhere}`,
    parametros
  );
  const total = Number(totalResultado.rows[0]?.total || 0);

  parametros.push(paginacion.limit, paginacion.offset);

  const resultado = await query(
    `SELECT p.id_poliza, p.numero_poliza, p.fecha_poliza, p.concepto,
            p.total_debito, p.total_credito, p.esta_cuadrada,
            p.referencia_general, p.fecha_creacion,
            tp.codigo AS codigo_tipo_poliza, tp.nombre AS tipo_poliza,
            ep.codigo AS estado_poliza, ep.nombre AS nombre_estado,
            pc.numero_periodo, pc.nombre_periodo
     FROM scc.poliza p
     JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
     JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     JOIN scc.periodo_contable pc ON pc.id_periodo = p.id_periodo
     WHERE ${clausulaWhere}
     ORDER BY p.fecha_poliza DESC, p.id_poliza DESC
     LIMIT $${parametros.length - 1} OFFSET $${parametros.length}`,
    parametros
  );

  return { filas: resultado.rows, total };
}

async function buscarPolizaConDetalle(idPoliza, idEmpresa) {
  const polizaResultado = await query(
    `SELECT p.*,
            tp.codigo AS codigo_tipo_poliza, tp.nombre AS tipo_poliza,
            ep.codigo AS estado_poliza, ep.nombre AS nombre_estado,
            pc.numero_periodo, pc.nombre_periodo,
            uc.nombres || ' ' || uc.apellidos AS creador,
            ua.nombres || ' ' || ua.apellidos AS aprobador
     FROM scc.poliza p
     JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
     JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
     JOIN scc.periodo_contable pc ON pc.id_periodo = p.id_periodo
     JOIN scc.usuario uc ON uc.id_usuario = p.id_usuario_creador
     LEFT JOIN scc.usuario ua ON ua.id_usuario = p.id_usuario_aprobador
     WHERE p.id_poliza = $1 AND p.id_empresa = $2`,
    [idPoliza, idEmpresa]
  );

  if (!polizaResultado.rows[0]) return null;

  const detalleResultado = await query(
    `SELECT dp.id_detalle_poliza, dp.linea, dp.id_cuenta, dp.id_tercero,
            dp.descripcion, dp.referencia_detalle, dp.debito, dp.credito,
            cc.codigo_cuenta, cc.nombre_cuenta,
            t.nombre_razon_social AS tercero
     FROM scc.detalle_poliza dp
     JOIN scc.catalogo_cuenta cc ON cc.id_cuenta = dp.id_cuenta
     LEFT JOIN scc.tercero t ON t.id_tercero = dp.id_tercero
     WHERE dp.id_poliza = $1
     ORDER BY dp.linea`,
    [idPoliza]
  );

  return {
    poliza: polizaResultado.rows[0],
    renglones: detalleResultado.rows,
  };
}

module.exports = {
  buscarPolizasPorEmpresa,
  buscarPolizaConDetalle,
};
