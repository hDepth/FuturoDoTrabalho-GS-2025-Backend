const Users = require("../models/users");
const Wallets = require("../models/wallets");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    const existing = await Users.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // createUser retorna apenas o ID numérico
    const userId = await Users.createUser({
      name,
      email,
      password_hash,
      role
    });

    // Wallet precisa receber o ID, não um objeto
    await Wallets.createWallet(userId);

    return res.json({
      message: "Usuário criado com sucesso",
      user: {
        id: userId,
        name,
        email,
        role
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao cadastrar usuário" });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const match = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!match) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.ID, role: user.ROLE },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login realizado",
      token,
      user
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao fazer login" });
  }
};
