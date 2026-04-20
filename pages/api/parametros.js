import { query } from '../../lib/db';

export default async function handler(req, res) {
  const ID_EMPRESA = 1; 

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT * FROM scc.configuracion_general WHERE id_empresa = $1`, 
        [ID_EMPRESA]
      );
      const parametrosData = result.rows.length > 0 ? result.rows[0] : null;
      res.status(200).json({ success: true, data: parametrosData });
    } catch (error) {
      console.error("Error al leer parámetros:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'PUT') {
    // Usamos EXACTAMENTE los nombres de la captura de DBeaver
    const { formato_numero_poliza, maximo_decimales, maneja_centros_costo, permite_edicion_poliza_aprobada, requiere_documento_fuente } = req.body;
    
    try {
      const checkResult = await query(`SELECT id_empresa FROM scc.configuracion_general WHERE id_empresa = $1`, [ID_EMPRESA]);
      
      if (checkResult.rows.length > 0) {
        // ACTUALIZAR
        await query(
          `UPDATE scc.configuracion_general SET 
           formato_numero_poliza = $1, maximo_decimales = $2, maneja_centros_costo = $3, 
           permite_edicion_poliza_aprobada = $4, requiere_documento_fuente = $5 
           WHERE id_empresa = $6`,
          [formato_numero_poliza, maximo_decimales, maneja_centros_costo, permite_edicion_poliza_aprobada, requiere_documento_fuente, ID_EMPRESA]
        );
      } else {
        // INSERTAR (Agregamos anio_inicio_operacion = 2026 por defecto porque es obligatorio en su BD)
        await query(
          `INSERT INTO scc.configuracion_general 
           (id_empresa, formato_numero_poliza, maximo_decimales, maneja_centros_costo, permite_edicion_poliza_aprobada, requiere_documento_fuente, anio_inicio_operacion) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [ID_EMPRESA, formato_numero_poliza, maximo_decimales, maneja_centros_costo, permite_edicion_poliza_aprobada, requiere_documento_fuente, 2026]
        );
      }
      
      res.status(200).json({ success: true, message: 'Parámetros guardados correctamente' });
    } catch (error) {
      console.error("Error al actualizar parámetros:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}