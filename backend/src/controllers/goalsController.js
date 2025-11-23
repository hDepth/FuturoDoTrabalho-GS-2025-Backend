const goalsModel = require("../models/goals");

exports.create = async (req, res) => {
  try {
    const goal = await goalsModel.createGoal(req.body);
    res.status(201).json(goal);
  } catch (err) {
    console.error("Erro ao criar goal:", err);
    res.status(500).json({ message: "Erro ao criar meta" });
  }
};

exports.getAll = async (_, res) => {
  try {
    const goals = await goalsModel.getAllGoals();
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar metas" });
  }
};

exports.getById = async (req, res) => {
  try {
    const goal = await goalsModel.getGoalById(req.params.id);

    if (!goal) return res.status(404).json({ message: "Meta não encontrada" });

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar meta" });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await goalsModel.updateGoal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Meta não encontrada" });

    res.json({ message: "Meta atualizada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar meta" });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await goalsModel.deleteGoal(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Meta não encontrada" });

    res.json({ message: "Meta deletada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar meta" });
  }
};
