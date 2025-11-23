// src/controllers/storeController.js
const storeModel = require("../models/store");
const walletsModel = require("../models/wallets");
const rewardsModel = require("../models/userRewards");
const transactionsModel = require("../models/transactions");
const db = require("../db");

/**
 * ============================================
 *  POST /store/purchase
 *  Compra um item da loja
 * ============================================
 */
exports.purchase = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId)
      return res.status(400).json({ message: "itemId é obrigatório" });

    connection = await db.getConnection();

    // 🔎 1. Buscar item
    const item = await storeModel.getStoreItem(itemId, connection);
    if (!item) {
      await connection.close();
      return res.status(404).json({ message: "Item não encontrado" });
    }

    const itemPrice = Number(item.PRICE);
    if (isNaN(itemPrice)) {
      throw new Error("Preço do item inválido (NaN)");
    }

    if (Number(item.STOCK) <= 0)
      return res.status(400).json({ message: "Item sem estoque" });

    // 💰 2. Buscar wallet
    const wallet = await walletsModel.getWalletByUser(userId, connection);
    if (!wallet) {
      await connection.close();
      return res.status(404).json({ message: "Carteira não encontrada" });
    }

    const currentCoins = Number(wallet.COINS);
    if (isNaN(currentCoins)) {
      throw new Error("Saldo da carteira inválido (NaN)");
    }

    if (currentCoins < itemPrice) {
      await connection.close();
      return res.status(400).json({ message: "Moedas insuficientes" });
    }

    const newBalance = currentCoins - itemPrice;

    // 🔻 3. Atualizar wallet
    await walletsModel.updateWalletByUser(
      userId,
      {
        coins: newBalance,
        xp: Number(wallet.XP || 0),
        gems: Number(wallet.GEMS || 0),
      },
      connection
    );

    // 🔄 4. Criar transação
    await transactionsModel.createTransaction(
      {
        userId,
        amount: -itemPrice,
        type: "PURCHASE",
        description: `Compra do item ${item.NAME}`,
      },
      connection
    );

    // 🎁 5. Criar reward (pendente)
    const reward = await rewardsModel.createReward(
      {
        userId,
        itemId,
        status: "PENDING",
      },
      connection
    );

    // 📦 6. Decrementar estoque
    const decOk = await storeModel.decrementStock(itemId, connection);
    if (!decOk) throw new Error("Falha ao decrementar estoque");

    // 🔥 Commit
    await connection.commit();

    res.status(201).json({
      message: "Item solicitado com sucesso",
      rewardId: reward.ID,
    });
  } catch (err) {
    console.error("Erro na compra:", err);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        console.error("Erro ao dar rollback:", rbErr);
      }
    }

    if (err.message?.includes("NaN")) {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: "Erro ao solicitar item" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {}
    }
  }
};

/**
 * ============================================
 *  GET /store/purchases
 *  Lista as compras do usuário logado
 * ============================================
 */
exports.getUserPurchases = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;

    connection = await db.getConnection();

    // 🔍 Buscar todas as recompensas/compras deste usuário
    const purchases = await rewardsModel.getRewardsByUser(userId, connection);

    // O modelo rewardsModel precisa ter um método getRewardsByUser()
    // que faça o JOIN entre reward + item
    // Se não tiver, eu te ajudo a criar.

    await connection.commit();

    return res.json(purchases);
  } catch (error) {
    console.error("Erro ao listar compras:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (_) {}
    }

    return res
      .status(500)
      .json({ message: "Erro ao listar compras do usuário." });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (_) {}
    }
  }
};
