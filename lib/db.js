import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_wcQ8fogTKR4n@ep-hidden-boat-am4jwy5x.c-5.us-east-1.aws.neon.tech/neondb',
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text, params) => pool.query(text, params);