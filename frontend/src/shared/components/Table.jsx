import EmptyState from './EmptyState';
import Pagination from './Pagination';

export default function Table({ columnas, datos, page, totalPages, onPageChange, onRowClick, cargando, vacio }) {
  if (cargando) {
    return (
      <div className="animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-2 h-10 rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!datos?.length) {
    return <EmptyState mensaje={vacio || 'Sin resultados'} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-left font-medium text-gray-600 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {datos.map((fila, idx) => (
            <tr
              key={fila.id_poliza || fila.id_cuenta || idx}
              onClick={() => onRowClick?.(fila)}
              className={onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'}
            >
              {columnas.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.cellClass || ''}`}>
                  {col.render ? col.render(fila) : fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {page && totalPages && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
