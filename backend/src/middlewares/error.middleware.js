function noEncontrado(req, res, next) {
  const err = new Error('Ruta no encontrada');
  err.status = 404;
  err.code = 'RUTA_NO_ENCONTRADA';
  next(err);
}

function manejarError(err, req, res, _next) {
  const estado = err.status || 500;
  const codigo = err.code || 'ERROR_INTERNO';

  if (estado === 500) {
    console.error('[COI ERROR]', {
      metodo: req.method,
      ruta: req.originalUrl,
      mensaje: err.message,
      pila: err.stack,
    });
  }

  return res.status(estado).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    code: codigo,
  });
}

module.exports = { noEncontrado, manejarError };
