import Table from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatters';

export default function MayorGeneralTable({ datos, meta, onPageChange, onVerAuxiliar }) {
  const columnas = [
    { key: 'codigo_cuenta', header: 'Cuenta', render: (f) => <span className="font-mono text-xs">{f.codigo_cuenta}</span> },
    { key: 'nombre_cuenta', header: 'Nombre' },
    { key: 'total_debitos', header: 'Total débitos', cellClass: 'text-right', render: (f) => formatCurrency(f.total_debitos) },
    { key: 'total_creditos', header: 'Total créditos', cellClass: 'text-right', render: (f) => formatCurrency(f.total_creditos) },
    { key: 'saldo', header: 'Saldo', cellClass: 'text-right font-semibold', render: (f) => formatCurrency(f.saldo) },
    {
      key: 'acciones', header: '',
      render: (f) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onVerAuxiliar?.(f); }}
          className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
        >
          Auxiliar
        </button>
      ),
    },
  ];

  return (
    <Table
      columnas={columnas}
      datos={datos}
      page={meta?.page}
      totalPages={meta?.total ? Math.ceil(meta.total / (meta.limit || 50)) : 1}
      onPageChange={onPageChange}
      vacio="Sin cuentas para el rango seleccionado"
    />
  );
}
