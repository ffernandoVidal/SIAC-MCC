import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import * as polizasApi from '../../api/contabilidad/polizas.api';

/* ── Listado paginado con filtros ── */
export function usePolizasQuery(filtros) {
  return useQuery({
    queryKey: ['polizas', filtros],
    queryFn: () => polizasApi.getPolizas(filtros).then((r) => r.data),
    enabled: !!filtros.id_periodo,
    keepPreviousData: true,
  });
}

/* ── Detalle de una póliza ── */
export function usePolizaQuery(id) {
  return useQuery({
    queryKey: ['poliza', id],
    queryFn: () => polizasApi.getPoliza(id).then((r) => r.data),
    enabled: !!id,
  });
}

/* ── Crear póliza ── */
export function useCreatePoliza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => polizasApi.createPoliza(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polizas'] }),
  });
}

/* ── Editar póliza ── */
export function useUpdatePoliza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => polizasApi.updatePoliza(id, data).then((r) => r.data),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({ queryKey: ['polizas'] });
      qc.invalidateQueries({ queryKey: ['poliza', variables.id] });
    },
  });
}

/* ── Aprobar póliza ── */
export function useAprobarPoliza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => polizasApi.aprobarPoliza(id).then((r) => r.data),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['polizas'] });
      qc.invalidateQueries({ queryKey: ['poliza', id] });
    },
  });
}

/* ── Anular póliza ── */
export function useAnularPoliza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }) => polizasApi.anularPoliza(id, motivo).then((r) => r.data),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({ queryKey: ['polizas'] });
      qc.invalidateQueries({ queryKey: ['poliza', variables.id] });
    },
  });
}

/* ── Catálogos (tipos + estados) ── */
export function useCatalogosPoliza() {
  return useQuery({
    queryKey: ['catalogos-poliza'],
    queryFn: () =>
      polizasApi.getCatalogos().then(([tipos, estados]) => ({
        tipos: tipos.data.data,
        estados: estados.data.data,
      })),
    staleTime: 5 * 60 * 1000,
  });
}

/* ── Periodos del ejercicio ── */
export function usePeriodosQuery(idEjercicio) {
  return useQuery({
    queryKey: ['periodos', idEjercicio],
    queryFn: () => polizasApi.getPeriodos(idEjercicio).then((r) => r.data.data),
    enabled: !!idEjercicio,
    staleTime: 5 * 60 * 1000,
  });
}

/* ── Buscar cuentas con debounce ── */
export function useBuscarCuentas(buscar) {
  const [debounced, setDebounced] = useState(buscar);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(buscar), 300);
    return () => clearTimeout(timer);
  }, [buscar]);

  return useQuery({
    queryKey: ['cuentas', debounced],
    queryFn: () => polizasApi.buscarCuentas(debounced).then((r) => r.data.data),
    enabled: debounced.length >= 2,
    staleTime: 60 * 1000,
  });
}

/* ── Buscar terceros con debounce ── */
export function useBuscarTerceros(buscar, tipo) {
  const [debounced, setDebounced] = useState(buscar);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(buscar), 300);
    return () => clearTimeout(timer);
  }, [buscar]);

  return useQuery({
    queryKey: ['terceros', debounced, tipo],
    queryFn: () => polizasApi.buscarTerceros(debounced, tipo).then((r) => r.data.data),
    enabled: debounced.length >= 2,
    staleTime: 60 * 1000,
  });
}
