const transactionsModel = require("../models/transactions");

// 📌 Lista apenas as transações do usuário logado
exports.listMine = async (req, res) => {
  try {
    const transactions = await transactionsModel.getTransactionsByUser(req.user.id);
    res.json(transactions);
  } catch (err) {
    console.error("Erro ao listar transações do usuário:", err);
    res.status(500).json({ message: "Erro ao buscar transações" });
  }
};

// 📌 Lista TODAS as transações (admin)
exports.listAll = async (_, res) => {
  try {
    const transactions = await transactionsModel.getAllTransactions();
    res.json(transactions);
  } catch (err) {
    console.error("Erro ao listar todas as transações:", err);
    res.status(500).json({ message: "Erro ao buscar transações" });
  }
};

// 📌 Buscar transação por ID
exports.getById = async (req, res) => {
  try {
    const transaction = await transactionsModel.getTransactionById(req.params.id);

    if (!transaction)
      return res.status(404).json({ message: "Transação não encontrada" });

    res.json(transaction);
  } catch (err) {
    console.error("Erro ao buscar transação por ID:", err);
    res.status(500).json({ message: "Erro ao buscar transação" });
  }
};

// 📌 Criar transação manualmente (opcional — só admin)
exports.create = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || !amount || !type)
      return res.status(400).json({ message: "Campos obrigatórios ausentes" });

    const transaction = await transactionsModel.createTransaction({
      userId,
      amount,
      type,
      description
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error("Erro ao criar transação:", err);
    res.status(500).json({ message: "Erro ao criar transação" });
  }
};
