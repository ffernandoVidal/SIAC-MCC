import api from '../axios';

export const getPolizas = (params) =>
  api.get('/contabilidad/polizas', { params });

export const getPoliza = (id) =>
  api.get(`/contabilidad/polizas/${id}`);

export const createPoliza = (data) =>
  api.post('/contabilidad/polizas', data);

export const updatePoliza = (id, data) =>
  api.put(`/contabilidad/polizas/${id}`, data);

export const aprobarPoliza = (id) =>
  api.post(`/contabilidad/polizas/${id}/aprobar`);

export const anularPoliza = (id, motivo) =>
  api.post(`/contabilidad/polizas/${id}/anular`, { motivo_anulacion: motivo });

export const getCatalogos = () =>
  Promise.all([
    api.get('/contabilidad/polizas/catalogos/tipos'),
    api.get('/contabilidad/polizas/catalogos/estados'),
  ]);

export const getPeriodos = (idEjercicio) =>
  api.get('/contabilidad/polizas/catalogos/periodos', {
    params: { id_ejercicio: idEjercicio },
  });

export const buscarCuentas = (buscar) =>
  api.get('/contabilidad/polizas/catalogos/cuentas', {
    params: { buscar, acepta_movimientos: true },
  });

export const buscarTerceros = (buscar, tipo) =>
  api.get('/contabilidad/polizas/catalogos/terceros', {
    params: { buscar, tipo },
  });
