const repositorio = require('./mayorGeneral.repository');
const { resolverPaginacion } = require('../../../shared/helpers/pagination');

async function listarMayorGeneral({ idEmpresa, parametros }) {
  if (!parametros.id_periodo) {
    const err = new Error('id_periodo es requerido para consultar el mayor general');
    err.status = 400;
    err.code = 'PARAMETRO_FALTANTE';
    throw err;
  }

  return repositorio.obtenerMayorGeneral({
    idEmpresa,
    idPeriodo: parametros.id_periodo,
    idTipoCuenta: parametros.id_tipo_cuenta,
    codigoCuenta: parametros.codigo_cuenta,
  });
}

async function exportarMayorGeneral({ idEmpresa, parametros }) {
  if (!parametros.id_periodo) {
    const err = new Error('id_periodo es requerido para exportar el mayor general');
    err.status = 400;
    err.code = 'PARAMETRO_FALTANTE';
    throw err;
  }

  return repositorio.obtenerMayorGeneral({
    idEmpresa,
    idPeriodo: parametros.id_periodo,
    idTipoCuenta: parametros.id_tipo_cuenta,
    codigoCuenta: parametros.codigo_cuenta,
  });
}

async function obtenerMovimientosCuenta({ idEmpresa, idCuenta, parametros }) {
  if (!parametros.id_periodo) {
    const err = new Error('id_periodo es requerido');
    err.status = 400;
    err.code = 'PARAMETRO_FALTANTE';
    throw err;
  }

  const paginacionBase = resolverPaginacion({
    page: parametros.page,
    limit: parametros.limit || 50,
  });

  const { filas, total } = await repositorio.obtenerMovimientosCuenta({
    idEmpresa,
    idCuenta,
    idPeriodo: parametros.id_periodo,
    paginacion: paginacionBase,
  });

  const paginacion = resolverPaginacion(
    { page: parametros.page, limit: parametros.limit || 50 },
    total
  );

  return {
    filas,
    paginacion: { page: paginacion.page, limit: paginacion.limit, total: paginacion.total },
  };
}

module.exports = { listarMayorGeneral, exportarMayorGeneral, obtenerMovimientosCuenta };
