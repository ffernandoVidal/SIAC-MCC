const servicioPoliza = require('./poliza.service');
const { exito } = require('../../../shared/helpers/response');

async function listar(req, res, next) {
  try {
    const resultado = await servicioPoliza.listarPolizas({
      idEmpresa: req.usuario.id_empresa,
      parametros: req.query,
    });
    return exito(res, resultado.filas, resultado.paginacion);
  } catch (err) {
    return next(err);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const resultado = await servicioPoliza.obtenerPoliza({
      idPoliza: Number(req.params.id),
      idEmpresa: req.usuario.id_empresa,
    });
    return exito(res, resultado);
  } catch (err) {
    return next(err);
  }
}

async function crear(req, res, next) {
  try {
    const resultado = await servicioPoliza.crearPoliza({
      idEmpresa: req.usuario.id_empresa,
      idUsuario: req.usuario.id_usuario,
      cuerpo: req.body,
      meta: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    return exito(res, resultado, null, 201);
  } catch (err) {
    return next(err);
  }
}

async function editar(req, res, next) {
  try {
    const resultado = await servicioPoliza.editarPoliza({
      idPoliza: Number(req.params.id),
      idEmpresa: req.usuario.id_empresa,
      idUsuario: req.usuario.id_usuario,
      cuerpo: req.body,
      meta: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    return exito(res, resultado);
  } catch (err) {
    return next(err);
  }
}

async function aprobar(req, res, next) {
  try {
    const resultado = await servicioPoliza.aprobarPoliza({
      idPoliza: Number(req.params.id),
      idEmpresa: req.usuario.id_empresa,
      idUsuario: req.usuario.id_usuario,
      meta: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    return exito(res, resultado);
  } catch (err) {
    return next(err);
  }
}

async function anular(req, res, next) {
  try {
    const resultado = await servicioPoliza.anularPoliza({
      idPoliza: Number(req.params.id),
      idEmpresa: req.usuario.id_empresa,
      idUsuario: req.usuario.id_usuario,
      motivo: req.body?.motivo_anulacion,
      meta: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    return exito(res, resultado);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, obtenerPorId, crear, editar, aprobar, anular };
