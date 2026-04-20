import { useQuery } from '@tanstack/react-query';
import * as mayorApi from '../../api/contabilidad/mayorGeneral.api';

export function useMayorGeneralQuery(filtros) {
  return useQuery({
    queryKey: ['mayor-general', filtros],
    queryFn: () => mayorApi.getMayorGeneral(filtros).then((r) => r.data),
    enabled: !!filtros.id_periodo,
  });
}

export function useAuxiliarCuenta(filtros, idCuenta) {
  return useQuery({
    queryKey: ['auxiliar', filtros, idCuenta],
    queryFn: () =>
      mayorApi.getAuxiliarCuenta(idCuenta, filtros).then((r) => r.data),
    enabled: !!idCuenta && !!filtros.id_periodo,
    keepPreviousData: true,
  });
}

export function useExportarMayorGeneral() {
  return {
    exportar: (filtros) =>
      mayorApi.exportarMayorGeneral(filtros).then((r) => r.data.data),
  };
}
