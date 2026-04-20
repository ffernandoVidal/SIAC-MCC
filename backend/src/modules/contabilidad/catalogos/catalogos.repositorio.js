const { query } = require('../../../config/db');

async function obtenerTiposPoliza() {
  const resultado = await query(
    'SELECT id_tipo_poliza, codigo, nombre, descripcion FROM scc.tipo_poliza ORDER BY nombre'
  );
  return resultado.rows;
}

async function obtenerEstadosPoliza() {
  const resultado = await query(
    'SELECT id_estado_poliza, codigo, nombre, descripcion FROM scc.estado_poliza ORDER BY nombre'
  );
  return resultado.rows;
}

async function obtenerPeriodos(idEjercicio) {
  const resultado = await query(
    `SELECT id_periodo, numero_periodo, nombre_periodo, fecha_inicio, fecha_fin, estado
     FROM scc.periodo_contable
     WHERE id_ejercicio = $1
     ORDER BY numero_periodo`,
    [idEjercicio]
  );
  return resultado.rows;
}

async function buscarCuentas({ idEmpresa, buscar, aceptaMovimientos }) {
  const condiciones = ['id_empresa = $1', "estado = 'ACTIVA'"];
  const parametros = [idEmpresa];

  if (aceptaMovimientos !== undefined) {
    parametros.push(aceptaMovimientos === 'true' || aceptaMovimientos === true);
    condiciones.push(`acepta_movimientos = $${parametros.length}`);
  }

  if (buscar) {
    parametros.push(`%${buscar}%`);
    condiciones.push(
      `(codigo_cuenta ILIKE $${parametros.length} OR nombre_cuenta ILIKE $${parametros.length})`
    );
  }

  const resultado = await query(
    `SELECT id_cuenta, codigo_cuenta, nombre_cuenta, naturaleza,
            acepta_movimientos, requiere_tercero
     FROM scc.catalogo_cuenta
     WHERE ${condiciones.join(' AND ')}
     ORDER BY codigo_cuenta
     LIMIT 50`,
    parametros
  );
  return resultado.rows;
}

async function buscarTerceros({ idEmpresa, buscar, tipo }) {
  const condiciones = ['id_empresa = $1', "estado = 'ACTIVO'"];
  const parametros = [idEmpresa];

  if (tipo) {
    parametros.push(tipo);
    condiciones.push(`tipo_tercero = $${parametros.length}`);
  }

  if (buscar) {
    parametros.push(`%${buscar}%`);
    condiciones.push(
      `(nombre_razon_social ILIKE $${parametros.length} OR identificacion_fiscal ILIKE $${parametros.length})`
    );
  }

  const resultado = await query(
    `SELECT id_tercero, tipo_tercero, nombre_razon_social, identificacion_fiscal
     FROM scc.tercero
     WHERE ${condiciones.join(' AND ')}
     ORDER BY nombre_razon_social
     LIMIT 50`,
    parametros
  );
  return resultado.rows;
}

module.exports = {
  obtenerTiposPoliza,
  obtenerEstadosPoliza,
  obtenerPeriodos,
  buscarCuentas,
  buscarTerceros,
};
