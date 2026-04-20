import { query } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { id_poliza, id } = req.query;
      const polizaId = id_poliza || id;
      if (!polizaId) return res.status(400).json({ success: false, error: 'id_poliza requerido' });

      const polizaResult = await query(
        `SELECT p.id_poliza, p.numero_poliza, p.fecha_poliza, p.concepto,
                p.total_debito AS total_debe, p.total_credito AS total_haber,
                p.fecha_creacion,
                tp.nombre AS tipo_poliza,
                ep.nombre AS estado,
                pc.nombre_periodo,
                uc.nombres || ' ' || uc.apellidos AS usuario_creo
         FROM scc.poliza p
         JOIN scc.tipo_poliza tp ON tp.id_tipo_poliza = p.id_tipo_poliza
         JOIN scc.estado_poliza ep ON ep.id_estado_poliza = p.id_estado_poliza
         JOIN scc.periodo_contable pc ON pc.id_periodo = p.id_periodo
         JOIN scc.usuario uc ON uc.id_usuario = p.id_usuario_creador
         WHERE p.id_poliza = $1`, [polizaId]
      );

      if (!polizaResult.rows[0]) return res.status(404).json({ success: false, error: 'No encontrada' });

      const detalleResult = await query(
        `SELECT dp.id_detalle_poliza, dp.numero_linea, dp.concepto_detalle,
                dp.debito, dp.credito,
                cc.codigo_cuenta, cc.nombre_cuenta,
                t.nombre_razon_social AS nombre_tercero
         FROM scc.detalle_poliza dp
         JOIN scc.catalogo_cuenta cc ON cc.id_cuenta = dp.id_cuenta
         LEFT JOIN scc.tercero t ON t.id_tercero = dp.id_tercero
         WHERE dp.id_poliza = $1 ORDER BY dp.numero_linea`, [polizaId]
      );

      return res.json({ success: true, data: { ...polizaResult.rows[0], renglones: detalleResult.rows } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
