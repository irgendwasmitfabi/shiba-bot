var RPGClasses = require('../../Models/RPG/RPGClasses');

module.exports = {
    createClass: async function createClass(user) {
          await new RPGClasses({
            Id: 1,
            Name: "Test123",
            Charisma: 10,
            Strength: 10,
            Dexterity: 16,
            Stealth: 14
          }).save();
      },
};