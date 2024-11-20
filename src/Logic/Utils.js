const Profile = require('../Models/Profile');

module.exports = {
  createProfile: async function createProfile(user) {
    var profile = await Profile.find({ UserID: user.id });
    if (!profile.length) {
      await new Profile({
        CurrentXP: 0,
        lastDaily: new Date().setDate(new Date().getDate() - 25),
        Level: 1,
        UserID: user.id,
        Wallet: 0,
        XPForNextLevel: 250,
      }).save();
    }
  },
  checkIfLevelUp: async function checkIfLevelUp(user) {
    var profile = await Profile.find({ UserID: user.id });

    var currentXP = profile[0].CurrentXP;
    var currentLevel = profile[0].Level;
    var xpForNextLevel = profile[0].XPForNextLevel

    var nextLevel = currentLevel + 1;
    // I assume here that the user can only level up one level at a time
    if (currentLevel && currentXP) {
      if (currentXP > xpForNextLevel) {
        await Profile.updateOne(
          { UserID: user.id },
          { $set: { Level: nextLevel } }
        );
        await Profile.updateOne(
          { UserID: user.id },
          { $inc: { Wallet:  nextLevel * 100} }
        );

        xpForNextLevel = nextLevel * 250;
        await Profile.updateOne(
          { UserID: user.id },
          { $set: { XPForNextLevel: xpForNextLevel } }
        );
        return true;
      }

      return false;
    }
  },
  giveXPToUser: async function giveXPToUser(user, amount) {
    try {
      await Profile.updateOne(
        { UserID: user.id },
        { $inc: { CurrentXP: amount } }
      );
    } catch (error) {
      console.log(error);
    }

  },
};