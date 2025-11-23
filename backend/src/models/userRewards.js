// src/models/userRewards.js
const db = require("../db");
const oracledb = require("oracledb");

// =========================
// CREATE REWARD
// now accepts connection optional
// =========================
exports.createReward = async ({ userId, itemId, status }, connection) => {
  const conn = connection || await db.getConnection();

  try {
    const result = await conn.execute(
      `
        INSERT INTO USER_REWARDS (USER_ID, ITEM_ID, STATUS, CLAIMED_AT)
        VALUES (:userId, :itemId, :status, SYSTIMESTAMP)
        RETURNING ID INTO :id
      `,
      {
        userId,
        itemId,
        status,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    if (!connection) await conn.commit();

    return { ID: result.outBinds.id[0], userId, itemId, status };

  } finally {
    if (!connection) await conn.close();
  }
};

// =========================
// LIST BY USER
// =========================
exports.getRewardsByUser = async (userId) => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `
        SELECT R.*, I.NAME, I.IMAGE_URL
        FROM USER_REWARDS R
        JOIN ITEMS I ON I.ID = R.ITEM_ID
        WHERE R.USER_ID = :userId
        ORDER BY R.CLAIMED_AT DESC
      `,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;

  } finally {
    await connection.close();
  }
};

// =========================
// LIST ALL (ADMIN)
// =========================
exports.getAllRewards = async () => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `
        SELECT R.*, U.NAME AS USER_NAME, I.NAME AS ITEM_NAME
        FROM USER_REWARDS R
        JOIN USERS U ON U.ID = R.USER_ID
        JOIN ITEMS I ON I.ID = R.ITEM_ID
        ORDER BY R.CLAIMED_AT DESC
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;

  } finally {
    await connection.close();
  }
};

// =========================
// UPDATE STATUS
// =========================
exports.updateStatus = async (id, status) => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `
        UPDATE USER_REWARDS
        SET STATUS = :status,
            RESOLVED_AT = CASE WHEN :status = 'RECEIVED' THEN SYSTIMESTAMP ELSE RESOLVED_AT END
        WHERE ID = :id
      `,
      { id, status }
    );

    await connection.commit();
    return result.rowsAffected > 0;

  } finally {
    await connection.close();
  }
};
