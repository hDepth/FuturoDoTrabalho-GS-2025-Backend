const db = require('../db');
const oracledb = require('oracledb');

async function createRedemption({ userId, storeItemId, priceCoins, priceGems }) {
  const conn = await db.getConnection();

  try {
    const result = await conn.execute(
      `INSERT INTO reward_redemptions 
        (user_id, store_item_id, price_coins, price_gems, status)
       VALUES 
        (:userId, :storeItemId, :priceCoins, :priceGems, 'completed')
       RETURNING id INTO :id`,
      {
        userId,
        storeItemId,
        priceCoins,
        priceGems,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    return {
      id: result.outBinds.id[0],
      userId,
      storeItemId,
      priceCoins,
      priceGems,
      status: 'completed'
    };
  } finally {
    await conn.close();
  }
}

module.exports = {
  createRedemption
};
