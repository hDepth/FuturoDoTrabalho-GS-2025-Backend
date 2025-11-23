const db = require("../db");
const oracledb = require("oracledb");

module.exports = {
  // Criar meta
  async createGoal(data) {
    const conn = await db.getConnection();
    try {
      const result = await conn.execute(
        `
        INSERT INTO goals (title, description, xp_reward, coins_reward, gems_reward)
        VALUES (:title, :description, :xp, :coins, :gems)
        RETURNING id INTO :id
        `,
        {
          title: data.title,
          description: data.description,
          xp: data.xp_reward,
          coins: data.coins_reward,
          gems: data.gems_reward,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      return { id: result.outBinds.id[0], ...data };
    } finally {
      await conn.close();
    }
  },

  // Listar metas
  async getAllGoals() {
    const conn = await db.getConnection();
    try {
      const result = await conn.execute(
        `
        SELECT id, title, description, xp_reward, coins_reward, gems_reward,
               created_at, updated_at
        FROM goals
        ORDER BY id
        `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows;
    } finally {
      await conn.close();
    }
  },

  // Buscar meta por ID
  async getGoalById(id) {
    const conn = await db.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM goals WHERE id = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows[0] || null;
    } finally {
      await conn.close();
    }
  },

  // Atualizar meta **COM UPDATE PARCIAL (evita erro de NULL)**
  async updateGoal(id, payload) {
    const conn = await db.getConnection();
    try {
      // Buscar registro atual
      const currentResult = await conn.execute(
        `SELECT * FROM goals WHERE id = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (currentResult.rows.length === 0) return null;
      const current = currentResult.rows[0];

      // Garantir que não vamos mandar NULL para colunas NOT NULL
      const updated = {
        title: payload.title ?? current.TITLE,
        description: payload.description ?? current.DESCRIPTION,
        xp_reward: payload.xp_reward ?? current.XP_REWARD,
        coins_reward: payload.coins_reward ?? current.COINS_REWARD,
        gems_reward: payload.gems_reward ?? current.GEMS_REWARD,
      };

      await conn.execute(
        `
        UPDATE goals
        SET 
          title = :title,
          description = :description,
          xp_reward = :xp_reward,
          coins_reward = :coins_reward,
          gems_reward = :gems_reward,
          updated_at = SYSTIMESTAMP
        WHERE id = :id
        `,
        { id, ...updated },
        { autoCommit: true }
      );

      return updated;
    } finally {
      await conn.close();
    }
  },

  // Remover meta
  async deleteGoal(id) {
    const conn = await db.getConnection();
    try {
      await conn.execute(
        `DELETE FROM goals WHERE id = :id`,
        { id },
        { autoCommit: true }
      );
      return true;
    } finally {
      await conn.close();
    }
  }
};
