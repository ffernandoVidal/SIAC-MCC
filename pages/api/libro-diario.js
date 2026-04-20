import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { id_empresa, id_periodo, fecha_desde, fecha_hasta } = req.query;
      const condiciones = ['p.id_empresa = $1', "ep.codigo = 'APROBADA'"];
      const params = [id_empresa || 1];

      if (id_periodo) { params.push(id_periodo); condiciones.push(`p.id_periodo = $${params.length}`); }
      if (fecha_desde) { params.push(fecha_desde); condiciones.push(`p.fecha_poliza >= $${params.length}`); }
      if (fecha_hasta) { params.push(fecha_hasta); condiciones.push(`p.fecha_poliza <= $${params.length}`); }

      const result = await query(
        `SELECT p.fecha_poliza, p.numero_poliza, tp.nombre AS tipo_poliza,
                dp.linea, cc.codigo_cuenta, cc.nombre_cuenta,
                dp.descripcion, dp.debito, dp.credito
         FROM scc.detalle_poliza dp
         JOIN scc.poliza p ON p.id_poliza = dp.id_poliza
         JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
         JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
         JOIN scc.catalogo_cuenta cc ON cc.id_cuenta = dp.id_cuenta
         WHERE ${condiciones.join(' AND ')}
         ORDER BY p.fecha_poliza, p.numero_poliza, dp.linea`, params
      );

      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
