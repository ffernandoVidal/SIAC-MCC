import api from '../axios';

export const getMayorGeneral = (params) =>
  api.get('/contabilidad/mayor-general', { params });

export const exportarMayorGeneral = (params) =>
  api.get('/contabilidad/mayor-general/exportar', { params });

export const getAuxiliarCuenta = (idCuenta, params) =>
  api.get(`/contabilidad/mayor-general/${idCuenta}/movimientos`, { params });
