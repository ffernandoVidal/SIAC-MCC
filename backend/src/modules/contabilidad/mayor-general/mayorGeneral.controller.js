const servicioMayorGeneral = require('./mayorGeneral.service');
const { exito } = require('../../../shared/helpers/response');

async function listar(req, res, next) {
  try {
    const datos = await servicioMayorGeneral.listarMayorGeneral({
      idEmpresa: req.usuario.id_empresa,
      parametros: req.query,
    });
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

async function exportar(req, res, next) {
  try {
    const datos = await servicioMayorGeneral.exportarMayorGeneral({
      idEmpresa: req.usuario.id_empresa,
      parametros: req.query,
    });
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

async function movimientos(req, res, next) {
  try {
    const resultado = await servicioMayorGeneral.obtenerMovimientosCuenta({
      idEmpresa: req.usuario.id_empresa,
      idCuenta: Number(req.params.id_cuenta),
      parametros: req.query,
    });
    return exito(res, resultado.filas, resultado.paginacion);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, exportar, movimientos };
