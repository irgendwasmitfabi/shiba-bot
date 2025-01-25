require('dotenv').config();
const Trophy = require('./Models/Trophy');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function loadTrophies() {
    const filePath = path.join(__dirname, 'Data', 'Trophies', 'Trophies.json');
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading trophies.json:', error.message);
      process.exit(1);
    }
}

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.mongoURL || "");
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function addItemsToDatabase(items) {
    try {
      await Trophy.insertMany(items);
      console.log('Items successfully added to the database!');
    } catch (error) {
      console.error('Error adding items to the database:', error.message);
    } finally {
      mongoose.connection.close();
    }
}

(async () => {
    const trophies = loadTrophies();
    await connectToDatabase();
    await addItemsToDatabase(trophies);
})();
