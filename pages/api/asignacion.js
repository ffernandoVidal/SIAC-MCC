import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id_empresa } = req.query; 
    try {
      let result;
      // Si eres SuperAdmin (1), ves todas las asignaciones
      if (id_empresa === '1' || !id_empresa) {
        result = await query(`
          SELECT ur.id_usuario, ur.id_rol, u.nombre_usuario, r.nombre_rol 
          FROM scc.usuario_rol ur
          JOIN scc.usuario u ON ur.id_usuario = u.id_usuario
          JOIN scc.rol r ON ur.id_rol = r.id_rol
        `);
      } else {
        // Si es admin local, cruzamos la tabla para mostrar SOLO las de su empresa
        result = await query(`
          SELECT ur.id_usuario, ur.id_rol, u.nombre_usuario, r.nombre_rol 
          FROM scc.usuario_rol ur
          JOIN scc.usuario u ON ur.id_usuario = u.id_usuario
          JOIN scc.rol r ON ur.id_rol = r.id_rol
          WHERE u.id_empresa = $1
        `, [id_empresa]);
      }
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  else if (req.method === 'POST') {
    const { id_usuario, id_rol } = req.body;
    try {
      await query('INSERT INTO scc.usuario_rol (id_usuario, id_rol) VALUES ($1, $2)', [id_usuario, id_rol]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  else if (req.method === 'DELETE') {
    const { id_usuario, id_rol } = req.body;
    try {
      await query('DELETE FROM scc.usuario_rol WHERE id_usuario = $1 AND id_rol = $2', [id_usuario, id_rol]);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}