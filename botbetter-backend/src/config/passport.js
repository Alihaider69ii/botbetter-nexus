const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User.model");
const { getMemory } = require("../models/Memory.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check for existing Google account
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email returned from Google"), null);

        // Link to existing local account if email matches
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.authProvider = "google";
          user.isVerified = true;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new Google user
        const referralCode = await User.generateUniqueReferralCode();
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          authProvider: "google",
          avatar: profile.photos?.[0]?.value,
          isVerified: true,
          referralCode,
        });
        await getMemory(user._id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
