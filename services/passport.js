const User = require("../models/user");
const config = require("../config");
const LocalStrategy = require("passport-local").Strategy;
const JwTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = (passport) => {
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user)
            return done(null, false, {
              message: `Invalid email or password`,
            });
          const isMatch = await user.matchPassword(password);
          if (!isMatch)
            return done(null, false, {
              message: `Invalid email or password`,
            });
          // if passwords match return user
          return done(null, user);
        } catch (err) {
          console.log("Error: ", err);
          return done(err, false);
        }
      }
    )
  );

  passport.use(
    new JwTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromHeader("authorization"),
        secretOrKey: config.secret,
      },
      async (jwtPayload, done) => {
        try {
          // Extract user
          const user = await User.findById(jwtPayload.sub);
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
