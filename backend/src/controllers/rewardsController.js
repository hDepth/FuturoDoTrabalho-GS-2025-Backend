const rewardsModel = require("../models/userRewards");

exports.listMine = async (req, res) => {
  try {
    const rewards = await rewardsModel.getRewardsByUser(req.user.id);
    res.json(rewards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar recompensas" });
  }
};

exports.listAll = async (_, res) => {
  try {
    const rewards = await rewardsModel.getAllRewards();
    res.json(rewards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar recompensas" });
  }
};

exports.markReady = async (req, res) => {
  try {
    const reward = await rewardsModel.updateStatus(req.params.id, "READY");

    if (!reward)
      return res.status(404).json({ message: "Recompensa não encontrada" });

    res.json({ message: "Recompensa marcada como pronta para retirada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar" });
  }
};

exports.markReceived = async (req, res) => {
  try {
    const reward = await rewardsModel.updateStatus(req.params.id, "RECEIVED");

    if (!reward)
      return res.status(404).json({ message: "Recompensa não encontrada" });

    res.json({ message: "Recompensa entregue ao usuário" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar" });
  }
};
