const express = require('express');
const autenticacion = require('../../../middlewares/auth.middleware');
const { requierePermiso } = require('../../../middlewares/rbac.middleware');
const controlador = require('./catalogos.controlador');
const PERMISOS = require('../../../shared/constants/permisos');

const enrutador = express.Router();

enrutador.use(autenticacion);

enrutador.get('/tipos', requierePermiso(PERMISOS.POLIZA_VER), controlador.listarTiposPoliza);
enrutador.get('/estados', requierePermiso(PERMISOS.POLIZA_VER), controlador.listarEstadosPoliza);
enrutador.get('/periodos', requierePermiso(PERMISOS.POLIZA_VER), controlador.listarPeriodos);
enrutador.get('/cuentas', requierePermiso(PERMISOS.CUENTA_VER), controlador.buscarCuentas);
enrutador.get('/terceros', requierePermiso(PERMISOS.POLIZA_VER), controlador.buscarTerceros);

module.exports = enrutador;
