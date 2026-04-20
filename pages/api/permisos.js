import { query } from '../../lib/db';

export default async function handler(req, res) {
  // 1. OBTENER TODOS LOS PERMISOS Y ASIGNACIONES (GET)
  if (req.method === 'GET') {
    try {
      // Traemos el catálogo completo de permisos ordenado por módulo
      const permisosRes = await query('SELECT * FROM scc.permiso ORDER BY modulo, nombre_permiso');
      
      // Traemos quién tiene qué
      const asignacionesRes = await query('SELECT id_rol, id_permiso FROM scc.rol_permiso');

      res.status(200).json({
        success: true,
        permisos: permisosRes.rows,
        asignaciones: asignacionesRes.rows
      });
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  // 2. GUARDAR NUEVOS PERMISOS PARA UN ROL (POST)
  else if (req.method === 'POST') {
    const { id_rol, permisos } = req.body; // permisos será un arreglo de IDs: [1, 2, 5, 8]

    if (!id_rol) {
      return res.status(400).json({ success: false, error: "Falta el ID del rol" });
    }

    try {
      // Iniciamos transacción segura
      await query('BEGIN'); 
      
      // 1er Paso: Barrer con los permisos anteriores de ese rol específico
      await query('DELETE FROM scc.rol_permiso WHERE id_rol = $1', [id_rol]);

      // 2do Paso: Si mandaste permisos marcados, los insertamos todos de un solo golpe
      if (permisos && permisos.length > 0) {
        // Armamos el query dinámico: (1, 5), (1, 6), (1, 8)...
        const values = permisos.map((id_p) => `(${id_rol}, ${id_p})`).join(', ');
        await query(`INSERT INTO scc.rol_permiso (id_rol, id_permiso) VALUES ${values}`);
      }

      // Confirmamos los cambios
      await query('COMMIT');
      res.status(200).json({ success: true, message: 'Permisos actualizados correctamente' });
      
    } catch (error) {
      // Si algo falla, deshacemos todo para no corromper la DB
      await query('ROLLBACK');
      console.error("Error al guardar permisos:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}