// src/models/transactions.js
const db = require("../db");
const oracledb = require("oracledb");

// =========================
// CREATE TRANSACTION
// =========================
exports.createTransaction = async ({ userId, amount, type, description }, connection) => {
  const conn = connection || await db.getConnection();

  try {
    const result = await conn.execute(
      `
        INSERT INTO TRANSACTIONS (USER_ID, AMOUNT, TYPE, DESCRIPTION, CREATED_AT)
        VALUES (:userId, :amount, :type, :description, SYSTIMESTAMP)
        RETURNING ID INTO :id
      `,
      {
        userId,
        amount: Number(amount),
        type,
        description,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    if (!connection) await conn.commit();

    return {
      ID: result.outBinds.id[0],
      userId,
      amount: Number(amount),
      type,
      description
    };

  } finally {
    if (!connection) await conn.close();
  }
};

// =========================
// LIST BY USER
// =========================
exports.getTransactionsByUser = async (userId) => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `
        SELECT *
        FROM TRANSACTIONS
        WHERE USER_ID = :userId
        ORDER BY CREATED_AT DESC
      `,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;

  } finally {
    await connection.close();
  }
};
