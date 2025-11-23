// src/seed.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.example') });
const usersModel = require('./models/users');
const walletsModel = require('./models/wallets');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    // admin
    const adminEmail = 'admin@allgoals.local';
    const userEmail = 'jennifer@allgoals.local';
    const adminExists = await usersModel.findByEmail(adminEmail);
    if (!adminExists) {
      const admin = await usersModel.createUser({ name: 'Admin', email: adminEmail, password: 'Senha123!', role: 'admin' });
      await walletsModel.createWallet(admin.id);
      console.log('Admin created:', adminEmail);
    } else {
      console.log('Admin already exists');
    }

    const userExists = await usersModel.findByEmail(userEmail);
    if (!userExists) {
      const u = await usersModel.createUser({ name: 'Jennifer', email: userEmail, password: 'senha123', role: 'user' });
      await walletsModel.createWallet(u.id);
      console.log('User created:', userEmail);
    } else {
      console.log('User already exists');
    }

    console.log('Seeding finished');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
