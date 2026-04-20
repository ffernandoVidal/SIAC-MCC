const express = require('express');
const autenticacion = require('../../../middlewares/auth.middleware');
const { requierePermiso } = require('../../../middlewares/rbac.middleware');
const controlador = require('./libroDiario.controller');
const PERMISOS = require('../../../shared/constants/permisos');

const enrutador = express.Router();

enrutador.use(autenticacion);

enrutador.get('/', requierePermiso(PERMISOS.REPORTE_VER), controlador.listar);
enrutador.get('/exportar', requierePermiso(PERMISOS.REPORTE_VER), controlador.exportar);

module.exports = enrutador;
