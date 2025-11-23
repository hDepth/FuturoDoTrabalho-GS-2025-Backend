const db = require('../db');
const oracledb = require('oracledb');

// Criar submission
async function createSubmission({ userId, goalId, evidenceUrl, comment }) {
  const conn = await db.getConnection();

  try {
    const result = await conn.execute(
      `INSERT INTO submissions (
         user_id, goal_id, evidence_url, comment_text, status
       ) VALUES (
         :user_id, :goal_id, :evidence_url, :comment_text, 'pending'
       )
       RETURNING id INTO :id`,
      {
        user_id: userId,
        goal_id: goalId,
        evidence_url: evidenceUrl,
        comment_text: comment,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    return {
      id: result.outBinds.id[0],
      userId,
      goalId,
      evidenceUrl,
      comment,
      status: "pending",
    };
  } finally {
    await conn.close();
  }
}

// Buscar todas submissões do usuário
async function findByUser(userId) {
  const conn = await db.getConnection();

  try {
    const res = await conn.execute(
      `SELECT *
         FROM submissions
        WHERE user_id = :user_id
        ORDER BY created_at DESC`,
      { user_id: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.rows;
  } finally {
    await conn.close();
  }
}

// Buscar por ID
async function findById(id) {
  const conn = await db.getConnection();

  try {
    const res = await conn.execute(
      `SELECT * FROM submissions WHERE id = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.rows[0];
  } finally {
    await conn.close();
  }
}

// Atualizar status + recompensas
async function updateStatus(id, status, awarded) {
  const conn = await db.getConnection();

  try {
    await conn.execute(
      `UPDATE submissions
          SET status = :status,
              awarded_xp = :xp,
              awarded_coins = :coins,
              awarded_gems = :gems,
              updated_at = SYSTIMESTAMP
        WHERE id = :id`,
      {
        id,
        status,
        xp: awarded?.xp || 0,
        coins: awarded?.coins || 0,
        gems: awarded?.gems || 0,
      },
      { autoCommit: true }
    );

    return true;
  } finally {
    await conn.close();
  }
}

// Deletar submission
async function deleteSubmission(id) {
  const conn = await db.getConnection();

  try {
    await conn.execute(
      `DELETE FROM submissions WHERE id = :id`,
      { id },
      { autoCommit: true }
    );
    return true;
  } finally {
    await conn.close();
  }
}

module.exports = {
  createSubmission,
  findByUser,
  findById,
  updateStatus,
  deleteSubmission,
};
