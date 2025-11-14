// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Banco de dados conectado');
    }
});

// Criar a tabela de usuários se ela não existir
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

module.exports = db;
