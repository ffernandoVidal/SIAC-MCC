import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { id_ejercicio } = req.query;
      if (!id_ejercicio) return res.status(400).json({ success: false, error: 'id_ejercicio requerido' });
      const result = await query(
        `SELECT pc.*, ef.anio,
                (SELECT COUNT(*) FROM scc.poliza p WHERE p.id_periodo = pc.id_periodo) AS total_polizas
         FROM scc.periodo_contable pc
         JOIN scc.ejercicio_fiscal ef ON ef.id_ejercicio = pc.id_ejercicio
         WHERE pc.id_ejercicio = $1 ORDER BY pc.numero_periodo`, [id_ejercicio]
      );
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id_periodo, estado } = req.body;
      if (!['ABIERTO', 'CERRADO'].includes(estado)) return res.status(400).json({ success: false, error: 'Estado inválido' });
      const fechaCierre = estado === 'CERRADO' ? 'CURRENT_TIMESTAMP' : 'NULL';
      await query(
        `UPDATE scc.periodo_contable SET estado = $1, fecha_cierre = ${fechaCierre}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_periodo = $2`,
        [estado, id_periodo]
      );
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
