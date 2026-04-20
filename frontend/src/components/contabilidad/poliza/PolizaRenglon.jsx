import BuscadorCuenta from './BuscadorCuenta';
import { formatCurrency } from '../../../shared/utils/formatters';

export default function PolizaRenglon({ renglon, index, onChange, onRemove, disabled }) {
  const actualizar = (campo, valor) => {
    const nuevo = { ...renglon, [campo]: valor };
    onChange(index, nuevo);
  };

  return (
    <tr className={disabled ? 'bg-gray-50' : ''}>
      {/* # */}
      <td className="px-2 py-2 text-center text-xs text-gray-400">{index + 1}</td>

      {/* Cuenta */}
      <td className="min-w-[220px] px-2 py-2">
        <BuscadorCuenta
          value={renglon.cuenta}
          onChange={(cuenta) => actualizar('cuenta', cuenta)}
          disabled={disabled}
        />
      </td>

      {/* Descripción */}
      <td className="px-2 py-2">
        <input
          type="text"
          value={renglon.descripcion_renglon || ''}
          onChange={(e) => actualizar('descripcion_renglon', e.target.value)}
          disabled={disabled}
          className="w-full rounded border border-gray-200 px-2 py-1 text-sm disabled:bg-gray-100"
          placeholder="Descripción"
        />
      </td>

      {/* Débito */}
      <td className="w-32 px-2 py-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={renglon.monto_debito || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            actualizar('monto_debito', val);
            if (val > 0) actualizar('monto_credito', 0);
          }}
          disabled={disabled}
          className="w-full rounded border border-gray-200 px-2 py-1 text-right text-sm disabled:bg-gray-100"
        />
      </td>

      {/* Crédito */}
      <td className="w-32 px-2 py-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={renglon.monto_credito || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            actualizar('monto_credito', val);
            if (val > 0) actualizar('monto_debito', 0);
          }}
          disabled={disabled}
          className="w-full rounded border border-gray-200 px-2 py-1 text-right text-sm disabled:bg-gray-100"
        />
      </td>

      {/* Referencia */}
      <td className="w-32 px-2 py-2">
        <input
          type="text"
          value={renglon.referencia || ''}
          onChange={(e) => actualizar('referencia', e.target.value)}
          disabled={disabled}
          className="w-full rounded border border-gray-200 px-2 py-1 text-sm disabled:bg-gray-100"
          placeholder="Ref."
        />
      </td>

      {/* Quitar */}
      <td className="px-2 py-2 text-center">
        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600"
            title="Quitar renglón"
          >
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}
