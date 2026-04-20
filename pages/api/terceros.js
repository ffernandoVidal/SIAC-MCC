import { query } from '../../lib/db';

export default async function handler(req, res) {
  // 1. OBTENER TERCEROS (AISLADOS POR EMPRESA)
  if (req.method === 'GET') {
    const { id_empresa } = req.query;
    try {
      let result;
      if (id_empresa === '1' || !id_empresa) {
        result = await query('SELECT * FROM scc.tercero ORDER BY id_tercero DESC');
      } else {
        result = await query('SELECT * FROM scc.tercero WHERE id_empresa = $1 ORDER BY id_tercero DESC', [id_empresa]);
      }
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error al obtener terceros:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  // 2. CREAR TERCERO (GUARDANDO A QUÉ EMPRESA PERTENECE)
  else if (req.method === 'POST') {
    const { id_empresa, tipo, nombre, nit } = req.body;
    try {
      const result = await query(
        `INSERT INTO scc.tercero (id_empresa, tipo_tercero, nombre_razon_social, identificacion_fiscal, estado) 
         VALUES ($1, $2, $3, $4, 'ACTIVO') RETURNING *`,
        [id_empresa, tipo, nombre, nit]
      );
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error al crear tercero:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}