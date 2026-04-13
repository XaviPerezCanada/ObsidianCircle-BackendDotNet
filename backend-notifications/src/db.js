'use strict';
/**
 * db.js — Capa de persistencia con sql.js (SQLite puro JavaScript)
 *
 * sql.js carga la DB en memoria desde un archivo .db en el disco.
 * Para persistir cambios usamos _save() después de cada escritura.
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'notifications.db');

let _SQL = null;  // sql.js module
let _db  = null;  // Database instance

// ─────────────────────────────────────────────────────────────────────────────
// Inicialización (debe llamarse una vez antes de usar cualquier otra función)
// ─────────────────────────────────────────────────────────────────────────────

async function initDb() {
  if (_db) return; // Ya inicializado

  const initSqlJs = require('sql.js');
  _SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new _SQL.Database(fileBuffer);
  } else {
    _db = new _SQL.Database();
  }

  _db.run(`PRAGMA journal_mode = WAL`);
  _initSchema();
  _save(); // Escribe el archivo si es nuevo
}

function _initSchema() {
  _db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id               INTEGER  PRIMARY KEY AUTOINCREMENT,
      task_description TEXT     NOT NULL,
      channels         TEXT     NOT NULL,
      tone             TEXT     NOT NULL,
      data             TEXT     DEFAULT '{}',
      urgency          TEXT     DEFAULT 'medium',
      urgency_reason   TEXT     DEFAULT '',
      urgency_provider TEXT     DEFAULT '',
      status           TEXT     DEFAULT 'pending'
                       CHECK(status IN ('pending','processing','processed','failed')),
      error_log        TEXT     DEFAULT '',
      created_at       TEXT     DEFAULT (datetime('now')),
      processed_at     TEXT
    )
  `);
}

/** Persiste el estado en memoria al archivo .db en disco */
function _save() {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ejecuta un SELECT y devuelve un array de objetos planos.
 */
function _query(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Ejecuta un INSERT/UPDATE/DELETE y persiste en disco.
 */
function _run(sql, params = []) {
  _db.run(sql, params);
  _save();
}

// ─────────────────────────────────────────────────────────────────────────────
// Operaciones CRUD
// ─────────────────────────────────────────────────────────────────────────────

function enqueueNotification({ task_description, channels, tone, data, urgency, urgency_reason, urgency_provider }) {
  _run(
    `INSERT INTO notifications
       (task_description, channels, tone, data, urgency, urgency_reason, urgency_provider)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      task_description,
      JSON.stringify(channels),
      tone,
      JSON.stringify(data || {}),
      urgency || 'medium',
      urgency_reason || '',
      urgency_provider || '',
    ]
  );
  // sql.js: last_insert_rowid() via exec() puede dar 0 en algunos contextos
  // Usamos MAX(id) como alternativa fiable
  const rows = _query(`SELECT MAX(id) AS id FROM notifications`);
  return Number(rows[0]?.id || 0);
}

function getOldestPending() {
  const rows = _query(
    `SELECT * FROM notifications WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
  );
  return rows[0] || null;
}

function setStatus(id, status, extra = {}) {
  if (extra.error_log) {
    _run(
      `UPDATE notifications
       SET status = ?,
           error_log = ?,
           processed_at = CASE WHEN ? IN ('processed','failed') THEN datetime('now') ELSE processed_at END
       WHERE id = ?`,
      [status, extra.error_log, status, id]
    );
  } else {
    _run(
      `UPDATE notifications
       SET status = ?,
           processed_at = CASE WHEN ? IN ('processed','failed') THEN datetime('now') ELSE processed_at END
       WHERE id = ?`,
      [status, status, id]
    );
  }
}

function getStats() {
  const rows = _query(`
    SELECT
      COUNT(*)                                                     AS total,
      SUM(CASE WHEN status = 'pending'    THEN 1 ELSE 0 END)      AS pending,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END)      AS processing,
      SUM(CASE WHEN status = 'processed'  THEN 1 ELSE 0 END)      AS processed,
      SUM(CASE WHEN status = 'failed'     THEN 1 ELSE 0 END)      AS failed
    FROM notifications
  `);
  return rows[0] || { total: 0, pending: 0, processing: 0, processed: 0, failed: 0 };
}

function getAllNotifications(status) {
  if (status) {
    return _query(
      `SELECT * FROM notifications WHERE status = ? ORDER BY created_at DESC`,
      [status]
    );
  }
  return _query(`SELECT * FROM notifications ORDER BY created_at DESC`);
}

function getNotificationById(id) {
  const rows = _query(`SELECT * FROM notifications WHERE id = ?`, [id]);
  return rows[0] || null;
}

module.exports = {
  initDb,
  enqueueNotification,
  getOldestPending,
  setStatus,
  getStats,
  getAllNotifications,
  getNotificationById,
};
