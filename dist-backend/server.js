"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Add a movie
app.post('/api/movies', (req, res) => {
    const { title, year } = req.body;
    if (!title || !year) {
        res.status(400).json({ success: false, message: 'Missing title or year' });
        return;
    }
    const stmt = db_1.datab.prepare('INSERT INTO movies (title, year) VALUES (?, ?)');
    stmt.run(title, year, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false });
        }
        return res.json({ success: true, id: this.lastID });
    });
});
// Get all movies
app.get('/api/movies', (req, res) => {
    db_1.datab.all('SELECT * FROM movies', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, data: rows });
    });
});
app.listen(PORT, () => {
    console.log('Server is running at http://localhost:${PORT}');
});
