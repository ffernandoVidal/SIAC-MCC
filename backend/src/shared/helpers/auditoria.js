async function insertarBitacora(cliente, params) {
  const {
    idEmpresa,
    idUsuario = null,
    tablaAfectada,
    idRegistroAfectado = null,
    accion,
    valorAnterior = null,
    valorNuevo = null,
    direccionIp = null,
    userAgent = null,
  } = params;

  await cliente.query(
    `INSERT INTO scc.bitacora_auditoria (
      id_empresa, id_usuario, tabla_afectada, id_registro_afectado,
      accion, valor_anterior, valor_nuevo, direccion_ip, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      idEmpresa,
      idUsuario,
      tablaAfectada,
      idRegistroAfectado,
      accion,
      valorAnterior ? JSON.stringify(valorAnterior) : null,
      valorNuevo ? JSON.stringify(valorNuevo) : null,
      direccionIp,
      userAgent,
    ]
  );
}

module.exports = { insertarBitacora };
