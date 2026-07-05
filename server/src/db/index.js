// db/index.js
// Database connection layer using sql.js (pure JS SQLite).
// Provides a wrapper that mimics better-sqlite3's synchronous API.
// On every write, the in-memory DB is flushed to disk.
// Also handles schema initialization and migrations on startup.

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'data', 'study-room.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

// Wrapper that mimics better-sqlite3's synchronous API on top of sql.js.
// Usage: db.prepare('SELECT * FROM x WHERE id = ?').get(id)
const dbWrapper = {
  // prepare() returns an object with run(), get(), and all() methods
  prepare(sql) {
    return {
      // run() — execute INSERT/UPDATE/DELETE and save to disk
      run(...params) {
        db.run(sql, params);
        save();
      },
      // get() — return the first matching row, or undefined
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      // all() — return all matching rows as an array
      all(...params) {
        const results = [];
        const stmt = db.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
    };
  },
  // exec() — run raw SQL (used for schema init)
  exec(sql) {
    db.exec(sql);
    save();
  },
};

// Flush the in-memory database to disk after every write
function save() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Initialize the database — called once on server startup
async function init() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  // Initialize schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);

  // Run migrations — safely add columns/tables that may not exist yet
  runMigrations();

  save();
}

// Run schema migrations that safely add new columns/tables to existing DBs
function runMigrations() {
  const migrations = [
    {
      name: 'add_user_id_to_participants',
      check: () => !hasColumn('participants', 'user_id'),
      up: () => db.run('ALTER TABLE participants ADD COLUMN user_id TEXT REFERENCES users(id)'),
    },
    // Add future migrations here, e.g.:
    // {
    //   name: 'add_avatar_to_users',
    //   check: () => !hasColumn('users', 'avatar_url'),
    //   up: () => db.run('ALTER TABLE users ADD COLUMN avatar_url TEXT'),
    // },
  ];

  for (const migration of migrations) {
    if (migration.check()) {
      console.log(`Running migration: ${migration.name}`);
      migration.up();
    }
  }
}

// Check if a column exists on a table using PRAGMA table_info
function hasColumn(table, column) {
  const result = db.exec(`PRAGMA table_info(${table})`);
  if (!result.length) return false;
  return result[0].values.some((row) => row[1] === column);
}

dbWrapper.init = init;

module.exports = dbWrapper;
