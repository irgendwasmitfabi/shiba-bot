const Profile = require('../Models/Profile');

module.exports = {
  createProfile: async function createProfile(user, guild) {
    const profile = await Profile.find({ UserID: user.id, GuildID: guild.id });
    if (!profile.length) {
      await new Profile({
        GuildID: guild.id,
        UserID: user.id,
        Wallet: 0,
        lastDaily: new Date().setDate(new Date().getDate() - 25),
      }).save();
    }
  }
};