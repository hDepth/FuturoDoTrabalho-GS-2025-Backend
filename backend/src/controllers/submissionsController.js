const submissionsModel = require('../models/submissions');
const walletsModel = require('../models/wallets');
const db = require('../db');

exports.create = async (req, res) => {
  try {
    const { goalId, evidenceUrl, comment } = req.body;

    if (!goalId || !evidenceUrl)
      return res.status(400).json({ message: "goalId e evidenceUrl são obrigatórios." });

    const created = await submissionsModel.createSubmission({
      userId: req.user.id,
      goalId,
      evidenceUrl,
      comment
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar submission:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

exports.listMine = async (req, res) => {
  try {
    const subs = await submissionsModel.findByUser(req.user.id);
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro" });
  }
};

exports.listAll = async (req, res) => {
  try {
    const conn = await db.getConnection();
    const result = await conn.execute(
      `SELECT * FROM submissions ORDER BY created_at DESC`,
      [],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );
    await conn.close();

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar no model
    const submission = await submissionsModel.findById(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission não encontrada" });
    }

    // Retornar a própria submission (já vem em UPPERCASE)
    return res.json(submission);

  } catch (err) {
    console.error("Erro ao buscar submission por ID:", err);
    res.status(500).json({ message: "Erro interno ao buscar submissão" });
  }
};

exports.approve = async (req, res) => {
  const id = req.params.id;
  const AWARDED = { xp: 50, coins: 20, gems: 1 };

  try {
    const submission = await submissionsModel.findById(id);
    if (!submission) return res.status(404).json({ message: "Submission não encontrada" });

    if (submission.STATUS === "approved")
      return res.status(400).json({ message: "Já aprovada" });

    // Atualiza carteira
    const userId = submission.USER_ID;

    const wallet = await walletsModel.getWalletByUser(userId);

    const newValues = {
      xp: (wallet.XP || 0) + AWARDED.xp,
      coins: (wallet.COINS || 0) + AWARDED.coins,
      gems: (wallet.GEMS || 0) + AWARDED.gems,
    };

    await walletsModel.updateWalletByUser(userId, newValues);

    await submissionsModel.updateStatus(id, "approved", AWARDED);

    res.json({ message: "Submission aprovada e recompensas aplicadas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao aprovar" });
  }
};

exports.reject = async (req, res) => {
  try {
    await submissionsModel.updateStatus(req.params.id, "rejected", {});
    res.json({ message: "Submission rejeitada" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao rejeitar" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const submission = await submissionsModel.findById(req.params.id);

    if (!submission)
      return res.status(404).json({ message: "Submission não encontrada" });

    if (submission.USER_ID !== req.user.id)
      return res.status(403).json({ message: "Não autorizado" });

    if (submission.STATUS !== "pending")
      return res.status(400).json({ message: "Só é possível cancelar submissões pendentes" });

    await submissionsModel.deleteSubmission(req.params.id);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Erro ao cancelar" });
  }
};
