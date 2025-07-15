"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.datab = void 0;
// db.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dataDir = path_1.default.resolve(__dirname, '../data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir);
}
const dbPath = path_1.default.resolve(__dirname, '../data/movies.db');
// const databInstance = new Database(dbPath);
exports.datab = new better_sqlite3_1.default(dbPath);
// Create table (runs once)
exports.datab.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    poster TEXT,
    overview TEXT
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 0 AND rating <= 10),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
  );
`);
const existingProfiles = exports.datab.prepare('SELECT COUNT(*) as count FROM profiles').get();
if (existingProfiles.count === 0) {
    exports.datab.prepare('INSERT INTO profiles (name) VALUES (?)').run('Test User');
    console.log('👤 Inserted mock profile: "Test User"');
}
