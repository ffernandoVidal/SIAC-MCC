import * as XLSX from 'xlsx';

/**
 * Exporta un array de objetos a archivo .xlsx
 * @param {Array} data - datos a exportar
 * @param {Array<{key:string, header:string, width?:number}>} columns - definición de columnas
 * @param {string} filename - nombre del archivo (sin extensión)
 */
export function exportToExcel(data, columns, filename = 'reporte') {
  const encabezados = columns.map((c) => c.header);
  const filas = data.map((fila) =>
    columns.map((c) => fila[c.key] ?? '')
  );

  const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);

  // Anchos de columna
  hoja['!cols'] = columns.map((c) => ({ wch: c.width || 15 }));

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
  XLSX.writeFile(libro, `${filename}.xlsx`);
}
