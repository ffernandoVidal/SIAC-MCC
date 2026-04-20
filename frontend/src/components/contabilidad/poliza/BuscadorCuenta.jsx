import { useState, useRef, useEffect } from 'react';
import { useBuscarCuentas } from '../../../hooks/contabilidad/usePolizas';

export default function BuscadorCuenta({ value, onChange, disabled = false }) {
  const [buscar, setBuscar] = useState('');
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const { data: cuentas, isLoading } = useBuscarCuentas(buscar);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const seleccionar = (cuenta) => {
    onChange(cuenta);
    setBuscar('');
    setAbierto(false);
  };

  const textoMostrado = value
    ? `${value.codigo_cuenta} - ${value.nombre_cuenta}`
    : '';

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={abierto ? buscar : textoMostrado}
        onChange={(e) => {
          setBuscar(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => {
          setBuscar('');
          setAbierto(true);
        }}
        disabled={disabled}
        placeholder="Buscar cuenta..."
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
      />

      {value && !abierto && (
        <button
          type="button"
          onClick={() => { onChange(null); setBuscar(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}

      {abierto && buscar.length >= 2 && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded border bg-white shadow-lg">
          {isLoading && <div className="px-3 py-2 text-xs text-gray-400">Buscando...</div>}
          {!isLoading && cuentas?.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">Sin resultados</div>
          )}
          {cuentas?.map((c) => (
            <button
              key={c.id_cuenta}
              type="button"
              onClick={() => seleccionar(c)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
            >
              <span className="font-mono text-xs text-gray-500">{c.codigo_cuenta}</span>{' '}
              {c.nombre_cuenta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
