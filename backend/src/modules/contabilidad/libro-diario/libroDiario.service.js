const repositorio = require('./libroDiario.repository');
const { resolverPaginacion } = require('../../../shared/helpers/pagination');

async function listarLibroDiario({ idEmpresa, parametros }) {
  if (!parametros.id_periodo) {
    const err = new Error('id_periodo es requerido para consultar el libro diario');
    err.status = 400;
    err.code = 'PARAMETRO_FALTANTE';
    throw err;
  }

  const paginacionBase = resolverPaginacion({
    page: parametros.page,
    limit: parametros.limit || 50,
  });

  const { filas, total } = await repositorio.obtenerLibroDiario({
    idEmpresa,
    idPeriodo: parametros.id_periodo,
    idTipoPoliza: parametros.id_tipo_poliza,
    fechaDesde: parametros.fecha_desde,
    fechaHasta: parametros.fecha_hasta,
    idCuenta: parametros.id_cuenta,
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

async function exportarLibroDiario({ idEmpresa, parametros }) {
  if (!parametros.id_periodo) {
    const err = new Error('id_periodo es requerido para exportar el libro diario');
    err.status = 400;
    err.code = 'PARAMETRO_FALTANTE';
    throw err;
  }

  const { filas } = await repositorio.obtenerLibroDiario({
    idEmpresa,
    idPeriodo: parametros.id_periodo,
    idTipoPoliza: parametros.id_tipo_poliza,
    fechaDesde: parametros.fecha_desde,
    fechaHasta: parametros.fecha_hasta,
    idCuenta: parametros.id_cuenta,
    paginacion: null, // sin paginar para exportación
  });

  return filas;
}

module.exports = { listarLibroDiario, exportarLibroDiario };
