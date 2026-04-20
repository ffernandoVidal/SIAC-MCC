import { query } from '../../lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  // 1. TRAER USUARIOS (CON FILTRO DE EMPRESA)
  if (req.method === 'GET') {
    const { id_empresa } = req.query; // Recibimos quién está pidiendo los datos

    try {
      let result;
      // Si es el SuperAdmin (Empresa 1), ve todo el universo
      if (id_empresa === '1' || !id_empresa) {
        result = await query(
          `SELECT id_usuario, id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, estado 
           FROM scc.usuario 
           ORDER BY id_empresa, id_usuario ASC`
        );
      } else {
        // Si es otra empresa, SOLO ve a los suyos
        result = await query(
          `SELECT id_usuario, id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, estado 
           FROM scc.usuario 
           WHERE id_empresa = $1
           ORDER BY id_usuario ASC`,
          [id_empresa]
        );
      }
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  // 2. CREAR USUARIO
  else if (req.method === 'POST') {
    const { id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, contrasena, estado } = req.body;
    if (!id_empresa) return res.status(400).json({ success: false, error: "Debes seleccionar un bufete" });

    try {
      const hash = await bcrypt.hash(contrasena, 10);
      const result = await query(
        `INSERT INTO scc.usuario (id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, contrasena_hash, estado) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`,
        [id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, hash, estado || 'ACTIVO']
      );
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  // 3. EDITAR USUARIO
  else if (req.method === 'PUT') {
    const { id_usuario, id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, contrasena, estado } = req.body;
    try {
      if (contrasena && contrasena.trim() !== '') {
        const hash = await bcrypt.hash(contrasena, 10);
        await query(
          `UPDATE scc.usuario SET id_empresa=$1, nombres=$2, apellidos=$3, nombre_usuario=$4, correo_electronico=$5, contrasena_hash=$6, estado=$7 WHERE id_usuario=$8`,
          [id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, hash, estado, id_usuario]
        );
      } else {
        await query(
          `UPDATE scc.usuario SET id_empresa=$1, nombres=$2, apellidos=$3, nombre_usuario=$4, correo_electronico=$5, estado=$6 WHERE id_usuario=$7`,
          [id_empresa, nombres, apellidos, nombre_usuario, correo_electronico, estado, id_usuario]
        );
      }
      res.status(200).json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}