import { useNavigate } from 'react-router-dom';
import Table from '../../../shared/components/Table';
import PolizaBadgeEstado from './PolizaBadgeEstado';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

export default function PolizaTable({ datos, meta, onPageChange, onAprobar, onAnular }) {
  const navigate = useNavigate();

  const columnas = [
    { key: 'numero_poliza', header: 'Número' },
    { key: 'tipo_poliza', header: 'Tipo' },
    { key: 'fecha_poliza', header: 'Fecha', render: (f) => formatDate(f.fecha_poliza) },
    { key: 'concepto', header: 'Concepto', cellClass: 'max-w-[250px] truncate' },
    {
      key: 'total_debito', header: 'Débito', cellClass: 'text-right',
      render: (f) => formatCurrency(f.total_debito),
    },
    {
      key: 'total_credito', header: 'Crédito', cellClass: 'text-right',
      render: (f) => formatCurrency(f.total_credito),
    },
    {
      key: 'estado_poliza', header: 'Estado',
      render: (f) => <PolizaBadgeEstado estado={f.estado_poliza} />,
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (f) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/contabilidad/polizas/${f.id_poliza}`); }}
            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
          >
            Ver
          </button>
          {f.estado_poliza === 'BORRADOR' && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/contabilidad/polizas/${f.id_poliza}/editar`); }}
                className="rounded px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAprobar(f); }}
                className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
              >
                Aprobar
              </button>
            </>
          )}
          {f.estado_poliza === 'APROBADA' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAnular(f); }}
              className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Anular
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columnas={columnas}
      datos={datos}
      page={meta?.page}
      totalPages={meta?.total ? Math.ceil(meta.total / (meta.limit || 20)) : 1}
      onPageChange={onPageChange}
      onRowClick={(f) => navigate(`/contabilidad/polizas/${f.id_poliza}`)}
      vacio="No se encontraron pólizas"
    />
  );
}
