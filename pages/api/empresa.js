import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM scc.empresa ORDER BY id_empresa ASC');
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'POST') {
    const { nombre_legal, nombre_comercial, nit, direccion, telefono, correo_electronico } = req.body;
    try {
      // INYECCIÓN MÁGICA: Agregamos GTQ y America/Guatemala para que Postgres no rechace la fila
      const result = await query(
        `INSERT INTO scc.empresa (nombre_legal, nombre_comercial, nit, direccion, telefono, correo_electronico, moneda_base, zona_horaria, estado) 
         VALUES ($1, $2, $3, $4, $5, $6, 'GTQ', 'America/Guatemala', 'ACTIVO') RETURNING *`,
        [nombre_legal, nombre_comercial, nit, direccion, telefono, correo_electronico]
      );
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error al crear empresa:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'PUT') {
    const { id_empresa, nombre_legal, nombre_comercial, nit, direccion, telefono, correo_electronico, estado } = req.body;
    if (!id_empresa) return res.status(400).json({ success: false, error: "Falta el id_empresa" });

    try {
      await query(
        `UPDATE scc.empresa 
         SET nombre_legal = $1, nombre_comercial = $2, nit = $3, direccion = $4, telefono = $5, correo_electronico = $6, estado = $7
         WHERE id_empresa = $8`,
        [nombre_legal, nombre_comercial, nit, direccion, telefono, correo_electronico, estado || 'ACTIVO', id_empresa]
      );
      res.status(200).json({ success: true, message: 'Empresa actualizada correctamente' });
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}