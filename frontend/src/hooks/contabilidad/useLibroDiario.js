import { useQuery } from '@tanstack/react-query';
import * as libroDiarioApi from '../../api/contabilidad/libroDiario.api';

export function useLibroDiarioQuery(filtros) {
  return useQuery({
    queryKey: ['libro-diario', filtros],
    queryFn: () => libroDiarioApi.getLibroDiario(filtros).then((r) => r.data),
    enabled: !!filtros.id_periodo,
    keepPreviousData: true,
  });
}

export function useExportarLibroDiario() {
  return {
    exportar: (filtros) =>
      libroDiarioApi.exportarLibroDiario(filtros).then((r) => r.data.data),
  };
}
