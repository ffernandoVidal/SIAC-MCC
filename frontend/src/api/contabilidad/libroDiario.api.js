import api from '../axios';

export const getLibroDiario = (params) =>
  api.get('/contabilidad/libro-diario', { params });

export const exportarLibroDiario = (params) =>
  api.get('/contabilidad/libro-diario/exportar', { params });
