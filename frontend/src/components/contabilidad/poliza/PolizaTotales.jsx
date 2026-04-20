import { formatCurrency } from '../../../shared/utils/formatters';

export default function PolizaTotales({ renglones }) {
  const totalDebito = renglones.reduce((sum, r) => sum + (parseFloat(r.monto_debito) || 0), 0);
  const totalCredito = renglones.reduce((sum, r) => sum + (parseFloat(r.monto_credito) || 0), 0);
  const diferencia = Math.abs(totalDebito - totalCredito);
  const cuadrada = diferencia < 0.01;

  return (
    <div className="flex items-center justify-end gap-6 rounded-lg border bg-white px-5 py-3">
      <div className="text-sm">
        <span className="text-gray-500">Total débito:</span>{' '}
        <span className="font-semibold">{formatCurrency(totalDebito)}</span>
      </div>
      <div className="text-sm">
        <span className="text-gray-500">Total crédito:</span>{' '}
        <span className="font-semibold">{formatCurrency(totalCredito)}</span>
      </div>
      <div className={`text-sm font-semibold ${cuadrada ? 'text-green-600' : 'text-red-600'}`}>
        {cuadrada ? '✓ Cuadrada' : `Diferencia: ${formatCurrency(diferencia)}`}
      </div>
    </div>
  );
}
