const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const polizaRutas = require('./modules/contabilidad/poliza/poliza.routes');
const libroDiarioRutas = require('./modules/contabilidad/libro-diario/libroDiario.routes');
const mayorGeneralRutas = require('./modules/contabilidad/mayor-general/mayorGeneral.routes');
const { noEncontrado, manejarError } = require('./middlewares/error.middleware');

const app = express();

// Seguridad y parsing
app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { mensaje: 'COI backend activo' } });
});

// Rutas v1
app.use('/api/v1/contabilidad/polizas', polizaRutas);
app.use('/api/v1/contabilidad/libro-diario', libroDiarioRutas);
app.use('/api/v1/contabilidad/mayor-general', mayorGeneralRutas);

// Manejo de errores
app.use(noEncontrado);
app.use(manejarError);

module.exports = app;
