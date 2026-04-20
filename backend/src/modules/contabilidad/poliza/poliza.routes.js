const express = require('express');
const autenticacion = require('../../../middlewares/auth.middleware');
const { requierePermiso } = require('../../../middlewares/rbac.middleware');
const validar = require('../../../middlewares/validate.middleware');
const controlador = require('./poliza.controller');
const validadores = require('./poliza.validator');
const catalogosRutas = require('../catalogos/catalogos.rutas');
const PERMISOS = require('../../../shared/constants/permisos');

const enrutador = express.Router();

enrutador.use(autenticacion);

// Catálogos auxiliares
enrutador.use('/catalogos', catalogosRutas);

// CRUD Pólizas
enrutador.get('/',
  validadores.listarPolizasValidador, validar,
  requierePermiso(PERMISOS.POLIZA_VER),
  controlador.listar
);

enrutador.get('/:id',
  validadores.idPolizaValidador, validar,
  requierePermiso(PERMISOS.POLIZA_VER),
  controlador.obtenerPorId
);

enrutador.post('/',
  validadores.crearPolizaValidador, validar,
  requierePermiso(PERMISOS.POLIZA_CREAR),
  controlador.crear
);

enrutador.put('/:id',
  validadores.editarPolizaValidador, validar,
  requierePermiso(PERMISOS.POLIZA_EDITAR),
  controlador.editar
);

enrutador.post('/:id/aprobar',
  validadores.idPolizaValidador, validar,
  requierePermiso(PERMISOS.POLIZA_APROBAR),
  controlador.aprobar
);

enrutador.post('/:id/anular',
  validadores.anularPolizaValidador, validar,
  requierePermiso(PERMISOS.POLIZA_ANULAR),
  controlador.anular
);

module.exports = enrutador;
