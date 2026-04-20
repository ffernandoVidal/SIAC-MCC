const { validationResult } = require('express-validator');

function validar(req, res, next) {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Errores de validación',
    code: 'VALIDACION_FALLIDA',
    details: resultado.array().map((e) => ({
      campo: e.path,
      mensaje: e.msg,
    })),
  });
}

module.exports = validar;
