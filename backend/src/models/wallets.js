// src/models/wallets.js
const db = require("../db");
const oracledb = require("oracledb");

module.exports = {
  // Criar carteira ao registrar usuário
  async createWallet(userId) {
    const conn = await db.getConnection();

    try {
      await conn.execute(
        `
        INSERT INTO wallets (user_id, coins, xp, gems)
        VALUES (:userId, 0, 0, 0)
        `,
        { userId },
        { autoCommit: true }
      );

      return { userId, coins: 0, xp: 0, gems: 0 };
    } finally {
      await conn.close();
    }
  },

  // Buscar carteira pelo ID do usuário
  // agora aceita conexão opcional
  async getWalletByUser(userId, connection) {
    const conn = connection || await db.getConnection();

    try {
      const result = await conn.execute(
        `
        SELECT id, user_id, coins, xp, gems
        FROM wallets
        WHERE user_id = :userId
        `,
        { userId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!connection) {
        return result.rows.length > 0 ? result.rows[0] : null;
      } else {
        // se dentro de transação, ainda retorna row[0] - mesmo comportamento
        return result.rows.length > 0 ? result.rows[0] : null;
      }
    } finally {
      if (!connection) await conn.close();
    }
  },

  // Atualizar carteira (método antigo, mantido) — aceita connection opcional
  async updateWallet(userId, coins, xp, gems, connection) {
    const conn = connection || await db.getConnection();

    try {
      await conn.execute(
        `
        UPDATE wallets
        SET coins = :coins,
            xp = :xp,
            gems = :gems
        WHERE user_id = :userId
        `,
        { coins: Number(coins), xp: Number(xp), gems: Number(gems), userId }
      );

      if (!connection) await conn.commit();

      return true;
    } finally {
      if (!connection) await conn.close();
    }
  },

  // 🔥 NOVO — método que o submissionsController espera
  // agora aceita conexão opcional e garante Number() para todos os binds
  async updateWalletByUser(userId, { coins, xp, gems }, connection) {
    const conn = connection || await db.getConnection();

    try {
      await conn.execute(
        `
        UPDATE wallets
        SET coins = :coins,
            xp = :xp,
            gems = :gems
        WHERE user_id = :userId
        `,
        {
          coins: Number(coins),
          xp: Number(xp),
          gems: Number(gems),
          userId
        }
      );

      if (!connection) await conn.commit();

      return true;
    } finally {
      if (!connection) await conn.close();
    }
  }
};
