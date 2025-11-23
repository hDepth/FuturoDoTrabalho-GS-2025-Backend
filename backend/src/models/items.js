const db = require("../db");
const oracledb = require("oracledb");

// =========================
// CREATE ITEM
// =========================
exports.createItem = async ({ name, description, price, stock, imageUrl }) => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `
      INSERT INTO ITEMS (NAME, DESCRIPTION, PRICE, STOCK, IMAGE_URL, CREATED_AT, UPDATED_AT)
      VALUES (:name, :description, :price, :stock, :imageUrl, SYSTIMESTAMP, SYSTIMESTAMP)
      RETURNING ID INTO :id
      `,
      {
        name,
        description,
        price,
        stock,
        imageUrl,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    await connection.commit();
    return {
      ID: result.outBinds.id[0],
      name,
      description,
      price,
      stock,
      imageUrl
    };

  } finally {
    await connection.close();
  }
};

// =========================
// GET ALL ITEMS
// =========================
exports.getAllItems = async () => {
    const connection = await db.getConnection();
  
    try {
      const result = await connection.execute(
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
ORDER BY CREATED_AT DESC
`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT } // <-- ESSENCIAL
      );
  
      return result.rows;
  
    } finally {
      await connection.close();
    }
  };
  
  // =========================
  // GET ITEM BY ID
  // =========================
  exports.getItemById = async (id) => {
    const connection = await db.getConnection();
  
    try {
      const result = await connection.execute(
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
WHERE ID = :id
`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT } // <-- ESSENCIAL
      );
  
      return result.rows[0] || null;
  
    } finally {
      await connection.close();
    }
  };

// =========================
// UPDATE ITEM
// =========================
exports.updateItem = async (id, data) => {
  const connection = await db.getConnection();

  const { name, description, price, stock, imageUrl } = data;

  try {
    const result = await connection.execute(
      `
      UPDATE ITEMS SET
          NAME = :name,
          DESCRIPTION = :description,
          PRICE = :price,
          STOCK = :stock,
          IMAGE_URL = :imageUrl,
          UPDATED_AT = SYSTIMESTAMP
      WHERE ID = :id
      `,
      { id, name, description, price, stock, imageUrl }
    );

    await connection.commit();
    return result.rowsAffected > 0;

  } finally {
    await connection.close();
  }
};

// =========================
// DELETE ITEM
// =========================
exports.deleteItem = async (id) => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `DELETE FROM ITEMS WHERE ID = :id`,
      { id }
    );

    await connection.commit();
    return result.rowsAffected > 0;

  } finally {
    await connection.close();
  }
};

// =========================
// DECREMENT STOCK
// =========================
exports.decrementStock = async (id) => {
  const connection = await db.getConnection();

  try {
    const result = await connection.execute(
      `
      UPDATE ITEMS
      SET STOCK = STOCK - 1,
          UPDATED_AT = SYSTIMESTAMP
      WHERE ID = :id AND STOCK > 0
      `,
      { id }
    );

    await connection.commit();
    return result.rowsAffected > 0;

  } finally {
    await connection.close();
  }
};
