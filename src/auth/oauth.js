import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import AuthorsModel from "../services/authors/schema.js";
import { authenticateAuthor } from "./tools.js";
const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}/authors/googleRedirect`,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      console.log(profile);

      const author = await AuthorsModel.findOne({
        email: profile.emails[0].value,
      });

      if (author) {
        const token = await authenticateAuthor(author);

        passportNext(null, { token, role: author.role });
      } else {
       

        const newAuthor = new AuthorsModel({
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        const savedAuthor = await newAuthor.save();
        const token = await authenticateAuthor(savedAuthor);

        
        passportNext(null, { token });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);


passport.serializeUser((data, passportNext) => {
  passportNext(null, data);
});

export default googleStrategy;
