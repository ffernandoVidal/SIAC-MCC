const express = require('express');
const autenticacion = require('../../../middlewares/auth.middleware');
const { requierePermiso } = require('../../../middlewares/rbac.middleware');
const controlador = require('./mayorGeneral.controller');
const PERMISOS = require('../../../shared/constants/permisos');

const enrutador = express.Router();

enrutador.use(autenticacion);

enrutador.get('/', requierePermiso(PERMISOS.REPORTE_VER), controlador.listar);
enrutador.get('/exportar', requierePermiso(PERMISOS.REPORTE_VER), controlador.exportar);
enrutador.get('/:id_cuenta/movimientos', requierePermiso(PERMISOS.REPORTE_VER), controlador.movimientos);

module.exports = enrutador;
