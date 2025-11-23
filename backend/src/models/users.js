const db = require("../db");
const oracledb = require("oracledb");

async function findByEmail(email) {
  const conn = await db.getConnection();

  try {
    const res = await conn.execute(
      `SELECT id, name, email, password_hash, role 
       FROM users 
       WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.rows[0];
  } finally {
    await conn.close();
  }
}

async function findById(id) {
  const conn = await db.getConnection();

  try {
    const res = await conn.execute(
      `SELECT id, name, email, password_hash, role
         FROM users
        WHERE id = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.rows[0];
  } finally {
    await conn.close();
  }
}


async function createUser({ name, email, password_hash, role }) {
  const conn = await db.getConnection();

  try {
    const res = await conn.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (:name, :email, :password_hash, :role)
       RETURNING id INTO :id`,
      {
        name,
        email,
        password_hash,
        role,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    return res.outBinds.id[0];
  } finally {
    await conn.close();
  }
}

module.exports = {
  findByEmail,
  createUser,
  findById,
};
