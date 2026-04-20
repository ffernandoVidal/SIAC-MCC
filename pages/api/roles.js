import { query } from '../../lib/db';

export default async function handler(req, res) {
  // 1. CREAR UN NUEVO ROL (POST)
  if (req.method === 'POST') {
    const { nombre_rol, descripcion, estado } = req.body;
    try {
      // Quitamos el id_empresa porque los roles son globales en el sistema
      const result = await query(
        `INSERT INTO scc.rol (nombre_rol, descripcion, estado) 
         VALUES ($1, $2, $3) RETURNING id_rol, nombre_rol`,
        [nombre_rol, descripcion, estado || 'ACTIVO']
      );
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error al crear rol:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  // 2. LEER TODOS LOS ROLES (GET)
  else if (req.method === 'GET') {
    try {
      // Quitamos el WHERE id_empresa = 1
      const result = await query(
        `SELECT id_rol, nombre_rol, descripcion, estado 
         FROM scc.rol ORDER BY id_rol DESC`
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error al leer roles:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 

  // 3. EDITAR / DESACTIVAR ROL (PUT)
  else if (req.method === 'PUT') {
    const { id_rol, nombre_rol, descripcion, estado } = req.body;
    try {
      await query(
        `UPDATE scc.rol SET nombre_rol=$1, descripcion=$2, estado=$3 WHERE id_rol=$4`,
        [nombre_rol, descripcion, estado, id_rol]
      );
      res.status(200).json({ success: true, message: 'Rol actualizado correctamente' });
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}