import PolizaRenglon from './PolizaRenglon';

const renglonVacio = () => ({
  cuenta: null,
  descripcion_renglon: '',
  monto_debito: 0,
  monto_credito: 0,
  referencia: '',
});

export default function PolizaRenglonesGrid({ renglones, setRenglones, disabled }) {
  const agregar = () => setRenglones([...renglones, renglonVacio()]);

  const actualizar = (idx, nuevo) => {
    const copia = [...renglones];
    copia[idx] = nuevo;
    setRenglones(copia);
  };

  const quitar = (idx) => {
    if (renglones.length <= 1) return;
    setRenglones(renglones.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Renglones</h3>
        {!disabled && (
          <button
            type="button"
            onClick={agregar}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
          >
            + Agregar renglón
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="w-10 px-2 py-2">#</th>
              <th className="px-2 py-2">Cuenta</th>
              <th className="px-2 py-2">Descripción</th>
              <th className="w-32 px-2 py-2 text-right">Débito</th>
              <th className="w-32 px-2 py-2 text-right">Crédito</th>
              <th className="w-32 px-2 py-2">Referencia</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {renglones.map((r, i) => (
              <PolizaRenglon
                key={i}
                renglon={r}
                index={i}
                onChange={actualizar}
                onRemove={quitar}
                disabled={disabled}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
