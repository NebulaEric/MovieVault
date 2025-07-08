"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.datab = void 0;
// db.ts
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// import { open } from 'sqlite';
// Ensure 'data' directory exists
const dbPath = path_1.default.resolve(__dirname, '../data');
if (!fs_1.default.existsSync(dbPath)) {
    fs_1.default.mkdirSync(dbPath);
}
// Create or open the database
const db = new sqlite3_1.default.Database(path_1.default.join(dbPath, 'movies.db'), (err) => {
    if (err)
        console.error('Error opening database:', err.message);
    else
        console.log('✅ Connected to SQLite database.');
});
exports.datab = new sqlite3_1.default.Database('./movies.db');
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL
    )
  `);
});
