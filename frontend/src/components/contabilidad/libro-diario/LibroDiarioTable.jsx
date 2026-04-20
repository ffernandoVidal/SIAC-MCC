import Table from '../../../shared/components/Table';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export default function LibroDiarioTable({ datos, meta, onPageChange }) {
  const columnas = [
    { key: 'fecha_poliza', header: 'Fecha', render: (f) => formatDate(f.fecha_poliza) },
    { key: 'tipo_poliza', header: 'Tipo' },
    { key: 'numero_poliza', header: 'No. Póliza' },
    { key: 'codigo_cuenta', header: 'Cuenta', render: (f) => <span className="font-mono text-xs">{f.codigo_cuenta}</span> },
    { key: 'nombre_cuenta', header: 'Nombre cuenta' },
    { key: 'descripcion_renglon', header: 'Descripción' },
    { key: 'monto_debito', header: 'Débito', cellClass: 'text-right', render: (f) => formatCurrency(f.monto_debito) },
    { key: 'monto_credito', header: 'Crédito', cellClass: 'text-right', render: (f) => formatCurrency(f.monto_credito) },
  ];

  return (
    <Table
      columnas={columnas}
      datos={datos}
      page={meta?.page}
      totalPages={meta?.total ? Math.ceil(meta.total / (meta.limit || 50)) : 1}
      onPageChange={onPageChange}
      vacio="No hay movimientos en el rango seleccionado"
    />
  );
}
