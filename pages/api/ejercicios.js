import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { id_empresa } = req.query;
      const where = id_empresa ? 'WHERE id_empresa = $1' : '';
      const params = id_empresa ? [id_empresa] : [];
      const result = await query(
        `SELECT ef.*, 
                (SELECT COUNT(*) FROM scc.periodo_contable pc WHERE pc.id_ejercicio = ef.id_ejercicio) AS total_periodos,
                (SELECT COUNT(*) FROM scc.periodo_contable pc WHERE pc.id_ejercicio = ef.id_ejercicio AND pc.estado = 'CERRADO') AS periodos_cerrados
         FROM scc.ejercicio_fiscal ef ${where} ORDER BY ef.anio DESC`, params
      );
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'POST') {
    try {
      const { id_empresa, anio, fecha_inicio, fecha_fin } = req.body;
      const result = await query(
        `INSERT INTO scc.ejercicio_fiscal (id_empresa, anio, fecha_inicio, fecha_fin) VALUES ($1,$2,$3,$4) RETURNING *`,
        [id_empresa, anio, fecha_inicio, fecha_fin]
      );
      // Auto-generar 12 periodos mensuales
      const ejercicio = result.rows[0];
      for (let m = 0; m < 12; m++) {
        const fi = new Date(anio, m, 1);
        const ff = new Date(anio, m + 1, 0);
        const nombreMes = fi.toLocaleString('es-GT', { month: 'long' }).replace(/^\w/, c => c.toUpperCase());
        await query(
          `INSERT INTO scc.periodo_contable (id_ejercicio, numero_periodo, nombre_periodo, fecha_inicio, fecha_fin)
           VALUES ($1,$2,$3,$4,$5)`,
          [ejercicio.id_ejercicio, m + 1, `${nombreMes} ${anio}`, fi.toISOString().split('T')[0], ff.toISOString().split('T')[0]]
        );
      }
      return res.json({ success: true, data: ejercicio });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id_ejercicio, estado } = req.body;
      await query(`UPDATE scc.ejercicio_fiscal SET estado = $1 WHERE id_ejercicio = $2`, [estado, id_ejercicio]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
