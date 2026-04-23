import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { catalogo, id_empresa, id_periodo, id_tipo_poliza, id_estado, pagina = 1, limite = 20 } = req.query;

      if (catalogo === 'tipos') {
        const result = await query(`SELECT id_tipo_poliza, nombre, codigo FROM scc.tipo_poliza ORDER BY nombre`);
        return res.json({ success: true, data: result.rows });
      }
      if (catalogo === 'estados') {
        const result = await query(`SELECT id_estado_poliza, nombre, codigo FROM scc.estado_poliza ORDER BY id_estado_poliza`);
        return res.json({ success: true, data: result.rows });
      }

      const condiciones = ['p.id_empresa = $1'];
      const params = [id_empresa || 1];

      if (id_periodo) { params.push(id_periodo); condiciones.push(`p.id_periodo = $${params.length}`); }
      if (id_tipo_poliza) { params.push(id_tipo_poliza); condiciones.push(`p.id_tipo_poliza = $${params.length}`); }
      if (id_estado) { params.push(id_estado); condiciones.push(`p.id_estado_poliza = $${params.length}`); }

      const where = condiciones.join(' AND ');
      const countResult = await query(`SELECT COUNT(*) AS total FROM scc.poliza p WHERE ${where}`, params);
      const total = parseInt(countResult.rows[0].total);

      const offset = (parseInt(pagina) - 1) * parseInt(limite);
      params.push(parseInt(limite), offset);

      const result = await query(
        `SELECT p.id_poliza, p.numero_poliza, p.fecha_poliza, p.concepto,
                p.total_debito AS total_debe, p.total_credito AS total_haber,
                tp.nombre AS tipo_poliza, ep.nombre AS estado,
                pc.nombre_periodo, u.nombres || ' ' || u.apellidos AS creador
         FROM scc.poliza p
         JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
         JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
         JOIN scc.periodo_contable pc ON pc.id_periodo = p.id_periodo
         JOIN scc.usuario u ON u.id_usuario = p.id_usuario_creador
         WHERE ${where}
         ORDER BY p.fecha_poliza DESC, p.id_poliza DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`, params
      );

      return res.json({ success: true, data: result.rows, total });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'POST') {
    try {
      await query('SET search_path TO scc, public');

      const { id_empresa, id_tipo_poliza, id_periodo, fecha_poliza, concepto, renglones } = req.body;
      
      const estRes = await query(`SELECT id_estado_poliza FROM scc.estado_poliza WHERE codigo = 'BORRADOR' LIMIT 1`);
      const idEstado = estRes.rows[0]?.id_estado_poliza || 1;

      const userRes = await query(`SELECT id_usuario FROM scc.usuario LIMIT 1`);
      const idUsuarioReal = userRes.rows[0]?.id_usuario;
      
      const numRes = await query(`SELECT COALESCE(MAX(numero_poliza::int), 0) + 1 AS siguiente FROM scc.poliza WHERE id_empresa = $1`, [id_empresa]);
      const numero = numRes.rows[0].siguiente;
      
      const totalDebe = renglones.reduce((s, r) => s + (parseFloat(r.debito) || 0), 0);
      const totalHaber = renglones.reduce((s, r) => s + (parseFloat(r.credito) || 0), 0);
      const cuadrada = Math.abs(totalDebe - totalHaber) < 0.01;

      const polizaRes = await query(
        `INSERT INTO scc.poliza (id_empresa, id_tipo_poliza, id_periodo, id_estado_poliza, id_usuario_creador, numero_poliza, fecha_poliza, concepto, total_debito, total_credito, esta_cuadrada)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [id_empresa, id_tipo_poliza, id_periodo, idEstado, idUsuarioReal, numero, fecha_poliza, concepto, totalDebe, totalHaber, cuadrada]
      );
      const poliza = polizaRes.rows[0];

      // ✂️ CORRECCIÓN DEFINITIVA: Le pusimos 'linea' justo como lo pide la BD
      for (const r of renglones) {
        await query(
          `INSERT INTO scc.detalle_poliza (id_poliza, linea, id_cuenta, id_tercero, debito, credito)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [poliza.id_poliza, r.numero_linea, r.id_cuenta, r.id_tercero || null, parseFloat(r.debito) || 0, parseFloat(r.credito) || 0]
        );
      }
      return res.json({ success: true, data: poliza });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id_poliza, id_estado } = req.body;
      await query(`UPDATE scc.poliza SET id_estado_poliza = $1 WHERE id_poliza = $2`, [id_estado, id_poliza]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}