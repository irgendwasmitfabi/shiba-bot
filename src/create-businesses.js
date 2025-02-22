require('dotenv').config();
const Business = require('./Models/Business');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function loadBusinesses() {
    const filePath = path.join(__dirname, 'Data', 'Businesses', 'Businesses.json');
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
      await Business.insertMany(items);
      console.log('Items successfully added to the database!');
    } catch (error) {
      console.error('Error adding items to the database:', error.message);
    } finally {
      mongoose.connection.close();
    }
}

(async () => {
    const businesses = loadBusinesses();
    await connectToDatabase();
    await addItemsToDatabase(businesses);
})();
