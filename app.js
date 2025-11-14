const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Banco SQLite
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
  console.log("Banco de dados conectado.");
});

// Criação das tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS administradores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cpf TEXT NOT NULL,
      codigo_imobiliaria TEXT NOT NULL,
      senha TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS moradores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cpf TEXT NOT NULL,
      codigo_condominio TEXT NOT NULL,
      senha TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      morador_id INTEGER,
      nome_conta TEXT,
      vencimento DATE,
      valor REAL,
      status TEXT,
      tipo_conta TEXT,
      FOREIGN KEY(morador_id) REFERENCES moradores(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      morador_id INTEGER,
      conta_id INTEGER,
      valor_pago REAL,
      data_pagamento DATE,
      FOREIGN KEY(morador_id) REFERENCES moradores(id),
      FOREIGN KEY(conta_id) REFERENCES contas(id)
    )
  `);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // Para receber os dados como JSON

// Caminho absoluto para o login
const caminhoLogin = path.join(__dirname, "../index.html");

// ===== ROTA: Cadastro de Administrador =====
app.post("/cadastro", (req, res) => {
  const { nome, email, cpf, codigo, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.send("<script>alert('As senhas não conferem!'); window.history.back();</script>");
  }

  const query = `INSERT INTO administradores (nome, email, cpf, codigo_imobiliaria, senha)
                 VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [nome, email, cpf, codigo, senha], function (err) {
    if (err) {
      console.error(err.message);
      return res.send("<script>alert('Erro ao cadastrar administrador!'); window.history.back();</script>");
    }

    // Redireciona para a página de login após o cadastro
    res.send(`
      <script>
        alert('Administrador cadastrado com sucesso!');
        window.location.href = '${caminhoLogin.replace(/\\/g, "/")}';
      </script>
    `);
  });
});

// ===== ROTA: Cadastro de Morador =====
app.post("/cadastro-morador", (req, res) => {
  const { nome, email, cpf, codigo, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.send("<script>alert('As senhas não conferem!'); window.history.back();</script>");
  }

  const query = `INSERT INTO moradores (nome, email, cpf, codigo_condominio, senha)
                 VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [nome, email, cpf, codigo, senha], function (err) {
    if (err) {
      console.error(err.message);
      return res.send("<script>alert('Erro ao cadastrar morador!'); window.history.back();</script>");
    }

    // Redireciona para a página de login após o cadastro
    res.send(`
      <script>
        alert('Morador cadastrado com sucesso!');
        window.location.href = '${caminhoLogin.replace(/\\/g, "/")}';
      </script>
    `);
  });
});

// ===== ROTA: Login =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM moradores WHERE email = ?", [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao buscar morador" });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    bcrypt.compare(password, user.senha, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao verificar a senha" });
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      res.status(200).json({
        message: "Login bem-sucedido",
        redirectTo: "/morador-dashboard.html",
      });
    });
  });
});

// ===== ROTA: Obter Contas de um Morador =====
app.get("/financas/:moradorId", (req, res) => {
  const { moradorId } = req.params;

  db.all("SELECT * FROM contas WHERE morador_id = ?", [moradorId], (err, contas) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar contas" });

    res.json(contas);
  });
});

// ===== ROTA: Obter Contas Pendentes =====
app.get("/financas/pendentes/:moradorId", (req, res) => {
  const { moradorId } = req.params;

  db.all(
    "SELECT * FROM contas WHERE morador_id = ? AND status = 'Pendente'",
    [moradorId],
    (err, contas) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar contas pendentes" });

      res.json(contas);
    }
  );
});

// ===== ROTA: Registrar Pagamento =====
app.post("/pagamento", (req, res) => {
  const { moradorId, contaId, valorPago, dataPagamento } = req.body;

  // Atualizar o status da conta para "Pago"
  db.run(
    "UPDATE contas SET status = 'Pago', valor_pago = ?, data_pagamento = ? WHERE id = ? AND morador_id = ?",
    [valorPago, dataPagamento, contaId, moradorId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao atualizar o status da conta" });
      }

      // Se a atualização for bem-sucedida, retornar uma mensagem de sucesso
      res.json({ message: "Pagamento registrado com sucesso!" });
    }
  );
});

// Rota para servir o arquivo index.html quando acessar a raiz '/'
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
