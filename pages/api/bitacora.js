import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id_empresa } = req.query; // Atrapamos el ID de quien pregunta

    try {
      let result;
      // Consulta base cruzando la bitácora con la tabla de usuarios
      const baseQuery = `
        SELECT b.*, u.nombre_usuario 
        FROM scc.bitacora_auditoria b
        LEFT JOIN scc.usuario u ON b.id_usuario = u.id_usuario
      `;

      // Si eres tú (SuperAdmin ID 1) o no hay empresa, ves todo
      if (id_empresa === '1' || !id_empresa) {
        result = await query(`${baseQuery} ORDER BY b.fecha_evento DESC`);
      } else {
        // Si es Juan u otro jefe, ve solo los eventos de SU bufete
        result = await query(
          `${baseQuery} WHERE b.id_empresa = $1 ORDER BY b.fecha_evento DESC`,
          [id_empresa]
        );
      }
      
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error cargando bitácora:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}