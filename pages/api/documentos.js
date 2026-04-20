import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { id_empresa } = req.query;
      const result = await query(
        `SELECT df.*, tdf.nombre AS tipo_documento
         FROM scc.documento_fuente df
         JOIN scc.tipo_documento_fuente tdf ON tdf.id_tipo_documento_fuente = df.id_tipo_documento_fuente
         WHERE df.id_empresa = $1 ORDER BY df.fecha_documento DESC`, [id_empresa || 1]
      );
      const tipos = await query('SELECT * FROM scc.tipo_documento_fuente ORDER BY nombre');
      return res.json({ success: true, data: result.rows, tipos: tipos.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'POST') {
    try {
      const { id_empresa, id_tipo_documento_fuente, numero_documento, serie_documento, fecha_documento, nombre_emisor, identificacion_emisor, monto_total, observaciones } = req.body;
      const result = await query(
        `INSERT INTO scc.documento_fuente (id_empresa, id_tipo_documento_fuente, numero_documento, serie_documento, fecha_documento, nombre_emisor, identificacion_emisor, monto_total, observaciones)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [id_empresa, id_tipo_documento_fuente, numero_documento, serie_documento || null, fecha_documento, nombre_emisor || null, identificacion_emisor || null, monto_total || null, observaciones || null]
      );
      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
