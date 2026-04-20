import Modal from '../../../shared/components/Modal';
import Table from '../../../shared/components/Table';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { useAuxiliarCuenta } from '../../../hooks/contabilidad/useMayorGeneral';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export default function AuxiliarCuentaModal({ cuenta, filtros, onClose }) {
  const { data, isLoading } = useAuxiliarCuenta(filtros, cuenta?.id_cuenta);

  const columnas = [
    { key: 'fecha_poliza', header: 'Fecha', render: (f) => formatDate(f.fecha_poliza) },
    { key: 'tipo_poliza', header: 'Tipo' },
    { key: 'numero_poliza', header: 'No. Póliza' },
    { key: 'descripcion_renglon', header: 'Descripción' },
    { key: 'monto_debito', header: 'Débito', cellClass: 'text-right', render: (f) => formatCurrency(f.monto_debito) },
    { key: 'monto_credito', header: 'Crédito', cellClass: 'text-right', render: (f) => formatCurrency(f.monto_credito) },
    { key: 'saldo_acumulado', header: 'Saldo', cellClass: 'text-right font-semibold', render: (f) => formatCurrency(f.saldo_acumulado) },
  ];

  return (
    <Modal
      abierto={!!cuenta}
      onClose={onClose}
      titulo={`Auxiliar: ${cuenta?.codigo_cuenta} - ${cuenta?.nombre_cuenta}`}
      ancho="max-w-4xl"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table columnas={columnas} datos={data || []} vacio="Sin movimientos" />
      )}
    </Modal>
  );
}
