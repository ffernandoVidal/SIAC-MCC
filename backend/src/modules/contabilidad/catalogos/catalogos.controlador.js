const repositorio = require('./catalogos.repositorio');
const { exito } = require('../../../shared/helpers/response');

async function listarTiposPoliza(req, res, next) {
  try {
    const datos = await repositorio.obtenerTiposPoliza();
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

async function listarEstadosPoliza(req, res, next) {
  try {
    const datos = await repositorio.obtenerEstadosPoliza();
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

async function listarPeriodos(req, res, next) {
  try {
    const { id_ejercicio } = req.query;
    if (!id_ejercicio) {
      const err = new Error('id_ejercicio es requerido');
      err.status = 400;
      err.code = 'PARAMETRO_FALTANTE';
      return next(err);
    }
    const datos = await repositorio.obtenerPeriodos(Number(id_ejercicio));
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

async function buscarCuentas(req, res, next) {
  try {
    const datos = await repositorio.buscarCuentas({
      idEmpresa: req.usuario.id_empresa,
      buscar: req.query.buscar,
      aceptaMovimientos: req.query.acepta_movimientos,
    });
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

async function buscarTerceros(req, res, next) {
  try {
    const datos = await repositorio.buscarTerceros({
      idEmpresa: req.usuario.id_empresa,
      buscar: req.query.buscar,
      tipo: req.query.tipo,
    });
    return exito(res, datos);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listarTiposPoliza,
  listarEstadosPoliza,
  listarPeriodos,
  buscarCuentas,
  buscarTerceros,
};
