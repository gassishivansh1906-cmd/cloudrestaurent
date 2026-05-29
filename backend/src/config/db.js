import sql from 'mssql';
import bcrypt from 'bcryptjs';

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'CloudRestaurant',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool;

/** Get (or lazily create) the shared connection pool. */
export async function getPool() {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(config).connect();
  return pool;
}

/** Convenience query helper. params is an object of { name: value }. */
export async function query(text, params = {}) {
  const p = await getPool();
  const request = p.request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return request.query(text);
}

/**
 * Wait for SQL Server to accept connections, then ensure the bootstrap
 * admin account exists. Useful when the DB container is still warming up.
 */
export async function initDb({ retries = 15, delayMs = 4000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await getPool();
      console.log('[db] Connected to SQL Server');
      await seedAdmin();
      return;
    } catch (err) {
      console.warn(`[db] Connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

/** Create the default admin if it does not already exist. */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@cloud.com';
  const name = process.env.ADMIN_NAME || 'Restaurant Admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await query('SELECT Id FROM dbo.Users WHERE Email = @Email', { Email: email });
  if (existing.recordset.length > 0) return;

  const hash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO dbo.Users (FullName, Email, PasswordHash, Role)
     VALUES (@FullName, @Email, @PasswordHash, 'admin')`,
    { FullName: name, Email: email, PasswordHash: hash }
  );
  console.log(`[db] Seeded admin account: ${email}`);
}

export { sql };
