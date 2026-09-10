const { Pool } = require("pg");

// На Render (и большинстве облачных провайдеров) удобнее задать одну
// переменную DATABASE_URL, а не 5 отдельных (DB_HOST/DB_PORT/...).
// Если DATABASE_URL присутствует — используем её, иначе собираем
// параметры из отдельных переменных (для локальной разработки/Docker).
const useConnectionString = Boolean(process.env.DATABASE_URL);

// Управляемые Postgres (Render, Supabase и т.п.) требуют SSL, но выдают
// самоподписанный сертификат — поэтому rejectUnauthorized: false.
// Для локальной БД (docker-compose) SSL не нужен.
const needsSSL = process.env.DB_SSL === "true" || useConnectionString;

const pool = useConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: needsSSL ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: needsSSL ? { rejectUnauthorized: false } : false,
    });

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

module.exports = pool;
