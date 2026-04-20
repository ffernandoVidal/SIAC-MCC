function exito(res, datos = null, meta = null, estado = 200) {
  const respuesta = { success: true, data: datos };
  if (meta) respuesta.meta = meta;
  return res.status(estado).json(respuesta);
}

module.exports = { exito };
