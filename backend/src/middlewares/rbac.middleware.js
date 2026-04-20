const { query } = require('../config/db');

function requierePermiso(permisoRequerido) {
  return async (req, res, next) => {
    try {
      const idUsuario = req.usuario?.id_usuario;
      if (!idUsuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          code: 'NO_AUTENTICADO',
        });
      }

      const codigos = Array.isArray(permisoRequerido)
        ? permisoRequerido
        : [permisoRequerido];

      const resultado = await query(
        `SELECT 1
         FROM scc.usuario_rol ur
         JOIN scc.rol_permiso rp ON rp.id_rol = ur.id_rol
         JOIN scc.permiso p ON p.id_permiso = rp.id_permiso
         WHERE ur.id_usuario = $1
           AND p.codigo_permiso = ANY($2)
         LIMIT 1`,
        [idUsuario, codigos]
      );

      if (resultado.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos suficientes para realizar esta acción',
          code: 'SIN_PERMISOS',
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { requierePermiso };
