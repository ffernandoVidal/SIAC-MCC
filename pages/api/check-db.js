import { query } from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Hacemos una consulta simple para ver si responde
    const result = await query('SELECT CURRENT_TIMESTAMP as hora, nombre_legal FROM scc.empresa LIMIT 1');
    
    res.status(200).json({ 
      status: 'Conectado con éxito ✅', 
      datos: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error de conexión ❌', 
      error: error.message 
    });
  }
}