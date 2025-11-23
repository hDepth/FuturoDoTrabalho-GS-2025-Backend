// src/models/store.js
const db = require("../db");
const oracledb = require("oracledb");

exports.getStoreItem = async (id, connection) => {
  const conn = connection || await db.getConnection();

  try {
    const result = await conn.execute(
      `SELECT 
         ID,
         NAME,
         TO_CHAR(DESCRIPTION) AS DESCRIPTION,
         PRICE,
         STOCK,
         IMAGE_URL,
         CREATED_AT,
         UPDATED_AT
       FROM ITEMS
       WHERE ID = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || null;

  } finally {
    if (!connection) await conn.close();
  }
};

exports.decrementStock = async (id, connection) => {
  const conn = connection || await db.getConnection();

  try {
    const result = await conn.execute(
      `
        UPDATE ITEMS
        SET STOCK = STOCK - 1,
            UPDATED_AT = SYSTIMESTAMP
        WHERE ID = :id AND STOCK > 0
      `,
      { id }
    );

    if (!connection) await conn.commit();

    return result.rowsAffected > 0;

  } finally {
    if (!connection) await conn.close();
  }
};
