const app = require('./src/app');
const { env } = require('./src/config/env');
const { query } = require('./src/config/db');

async function bootstrap() {
  await query('SELECT 1');

  app.listen(env.port, () => {
    console.log(`COI backend escuchando en puerto ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('No fue posible iniciar el backend COI:', error.message);
  process.exit(1);
});
