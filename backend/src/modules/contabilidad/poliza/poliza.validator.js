const { body, param, query } = require('express-validator');

const crearPolizaValidador = [
  body('id_periodo')
    .isInt({ gt: 0 }).withMessage('id_periodo es requerido y debe ser entero positivo'),
  body('id_tipo_poliza')
    .isInt({ gt: 0 }).withMessage('id_tipo_poliza es requerido y debe ser entero positivo'),
  body('fecha_poliza')
    .isISO8601().withMessage('fecha_poliza debe ser una fecha válida ISO 8601')
    .custom((valor) => {
      const fecha = new Date(valor);
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(23, 59, 59, 999);
      if (fecha > manana) throw new Error('fecha_poliza no puede ser futura más de 1 día');
      return true;
    }),
  body('concepto')
    .trim().notEmpty().withMessage('concepto es requerido')
    .isLength({ max: 500 }).withMessage('concepto no puede exceder 500 caracteres'),
  body('referencia_general')
    .optional().trim()
    .isLength({ max: 150 }).withMessage('referencia_general no puede exceder 150 caracteres'),
  body('id_documento_fuente')
    .optional()
    .isInt({ gt: 0 }).withMessage('id_documento_fuente debe ser entero positivo'),
  body('renglones')
    .isArray({ min: 2 }).withMessage('Debes enviar al menos 2 renglones'),
  body('renglones.*.id_cuenta')
    .isInt({ gt: 0 }).withMessage('Cada renglón requiere id_cuenta válido'),
  body('renglones.*.debito')
    .optional().isFloat({ min: 0 }).withMessage('debito debe ser >= 0'),
  body('renglones.*.credito')
    .optional().isFloat({ min: 0 }).withMessage('credito debe ser >= 0'),
  body('renglones.*.descripcion')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('descripcion del renglón no puede exceder 500 caracteres'),
  body('renglones.*.id_tercero')
    .optional().isInt({ gt: 0 }).withMessage('id_tercero debe ser entero positivo'),
  body('renglones').custom((renglones) => {
    if (!Array.isArray(renglones)) return true;
    for (let i = 0; i < renglones.length; i++) {
      const d = Number(renglones[i].debito || 0);
      const c = Number(renglones[i].credito || 0);
      if ((d > 0 && c > 0) || (d === 0 && c === 0)) {
        throw new Error(
          `Renglón ${i + 1}: exactamente uno de debito o credito debe ser > 0`
        );
      }
    }
    return true;
  }),
];

const editarPolizaValidador = [
  param('id').isInt({ gt: 0 }).withMessage('id de póliza inválido'),
  body('concepto')
    .optional().trim().notEmpty()
    .isLength({ max: 500 }).withMessage('concepto no puede exceder 500 caracteres'),
  body('fecha_poliza')
    .optional().isISO8601().withMessage('fecha_poliza debe ser válida'),
  body('referencia_general')
    .optional().trim()
    .isLength({ max: 150 }).withMessage('referencia_general no puede exceder 150 caracteres'),
  body('id_documento_fuente')
    .optional().isInt({ gt: 0 }),
  body('renglones')
    .optional().isArray({ min: 2 }).withMessage('Debes enviar al menos 2 renglones'),
  body('renglones.*.id_cuenta')
    .optional().isInt({ gt: 0 }).withMessage('id_cuenta inválido'),
  body('renglones.*.debito')
    .optional().isFloat({ min: 0 }),
  body('renglones.*.credito')
    .optional().isFloat({ min: 0 }),
  body('renglones.*.descripcion')
    .optional().trim()
    .isLength({ max: 500 }),
  body('renglones.*.id_tercero')
    .optional().isInt({ gt: 0 }),
  body('renglones').optional().custom((renglones) => {
    if (!Array.isArray(renglones)) return true;
    for (let i = 0; i < renglones.length; i++) {
      const d = Number(renglones[i].debito || 0);
      const c = Number(renglones[i].credito || 0);
      if ((d > 0 && c > 0) || (d === 0 && c === 0)) {
        throw new Error(
          `Renglón ${i + 1}: exactamente uno de debito o credito debe ser > 0`
        );
      }
    }
    return true;
  }),
];

const idPolizaValidador = [
  param('id').isInt({ gt: 0 }).withMessage('id de póliza inválido'),
];

const listarPolizasValidador = [
  query('page').optional().isInt({ gt: 0 }),
  query('limit').optional().isInt({ gt: 0, lt: 101 }),
  query('id_periodo').optional().isInt({ gt: 0 }),
  query('id_tipo_poliza').optional().isInt({ gt: 0 }),
  query('estado').optional().isString(),
  query('fecha_desde').optional().isISO8601(),
  query('fecha_hasta').optional().isISO8601(),
  query('numero_poliza').optional().isString(),
];

const anularPolizaValidador = [
  param('id').isInt({ gt: 0 }).withMessage('id de póliza inválido'),
  body('motivo_anulacion')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('motivo_anulacion no puede exceder 500 caracteres'),
];

module.exports = {
  crearPolizaValidador,
  editarPolizaValidador,
  idPolizaValidador,
  listarPolizasValidador,
  anularPolizaValidador,
};
