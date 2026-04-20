import { useState } from 'react';

export default function DatabaseTest() {
  const [respuesta, setRespuesta] = useState(null);

  const probarConexion = async () => {
    const res = await fetch('/api/check-db');
    const data = await res.json();
    setRespuesta(data);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Control de Base de Datos</h1>
      <p>Módulo: Configuración y Base de Datos</p>
      
      <button 
        onClick={probarConexion}
        style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Verificar Conexión Real
      </button>

      {respuesta && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Estado del Servidor: {respuesta.status}</h3>
          {respuesta.datos && (
            <div>
              <p><strong>Empresa detectada:</strong> {respuesta.datos.nombre_legal}</p>
              <p><strong>Hora del servidor DB:</strong> {respuesta.datos.hora}</p>
            </div>
          )}
          {respuesta.error && <p style={{ color: 'red' }}>Error: {respuesta.error}</p>}
        </div>
      )}
    </div>
  );
}