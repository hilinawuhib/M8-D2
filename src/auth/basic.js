import createError from "http-errors";
import atob from "atob";
import BlogsModel from "../services/blogposts/schema.js";
import AuthorsModel from "../services/authors/schema.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createError(401, "Please provide credentials in Authorization header")
    );
  } else {
    const base64Credentials = req.headers.authorization.split(" ")[1];

    const [email, password] = atob(base64Credentials).split(":");

    const author = await AuthorsModel.checkCredentials(email, password);

    if (author) {
      req.author = author;
      next();
    } else {
      next(createError(401, "Credentials are not OK!"));
    }
  }
};

