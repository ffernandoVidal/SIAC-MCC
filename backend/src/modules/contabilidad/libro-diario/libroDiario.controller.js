const servicioLibroDiario = require('./libroDiario.service');
const { exito } = require('../../../shared/helpers/response');

async function listar(req, res, next) {
  try {
    const resultado = await servicioLibroDiario.listarLibroDiario({
      idEmpresa: req.usuario.id_empresa,
      parametros: req.query,
    });
    return exito(res, resultado.filas, resultado.paginacion);
  } catch (err) {
    return next(err);
  }
}

async function exportar(req, res, next) {
  try {
    const datos = await servicioLibroDiario.exportarLibroDiario({
      idEmpresa: req.usuario.id_empresa,
      parametros: req.query,
    });
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, exportar };
