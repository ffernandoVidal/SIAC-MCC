import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { id_empresa, buscar, solo_movimientos } = req.query;
      const condiciones = ['id_empresa = $1'];
      const params = [id_empresa || 1];
      if (buscar) {
        params.push(`%${buscar}%`);
        condiciones.push(`(codigo_cuenta ILIKE $${params.length} OR nombre_cuenta ILIKE $${params.length})`);
      }
      if (solo_movimientos === 'true') {
        condiciones.push(`acepta_movimientos = true AND estado = 'ACTIVA'`);
      }
      const result = await query(
        `SELECT cc.*, tc.nombre AS tipo_cuenta_nombre
         FROM scc.catalogo_cuenta cc
         JOIN scc.tipo_cuenta tc ON tc.id_tipo_cuenta = cc.id_tipo_cuenta
         WHERE ${condiciones.join(' AND ')}
         ORDER BY cc.codigo_cuenta`, params
      );
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'POST') {
    try {
      const { id_empresa, id_tipo_cuenta, id_cuenta_padre, codigo_cuenta, nombre_cuenta, descripcion, nivel, acepta_movimientos, requiere_tercero, naturaleza } = req.body;
      const result = await query(
        `INSERT INTO scc.catalogo_cuenta (id_empresa, id_tipo_cuenta, id_cuenta_padre, codigo_cuenta, nombre_cuenta, descripcion, nivel, acepta_movimientos, requiere_tercero, naturaleza)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [id_empresa, id_tipo_cuenta, id_cuenta_padre || null, codigo_cuenta, nombre_cuenta, descripcion || null, nivel || 1, acepta_movimientos !== false, requiere_tercero || false, naturaleza || 'DEUDORA']
      );
      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { id_cuenta, nombre_cuenta, descripcion, acepta_movimientos, requiere_tercero, estado } = req.body;
      await query(
        `UPDATE scc.catalogo_cuenta SET nombre_cuenta = COALESCE($1, nombre_cuenta), descripcion = $2,
         acepta_movimientos = COALESCE($3, acepta_movimientos), requiere_tercero = COALESCE($4, requiere_tercero),
         estado = COALESCE($5, estado), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_cuenta = $6`,
        [nombre_cuenta, descripcion, acepta_movimientos, requiere_tercero, estado, id_cuenta]
      );
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
