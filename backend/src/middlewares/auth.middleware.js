const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function autenticacion(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Debes iniciar sesión para continuar',
      code: 'NO_AUTENTICADO',
    });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.usuario = {
      id_usuario: Number(payload.id_usuario || payload.id),
      id_empresa: Number(payload.id_empresa),
      nombre: payload.nombre,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
    };
    return next();
  } catch (_err) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      code: 'TOKEN_INVALIDO',
    });
  }
}

module.exports = autenticacion;
