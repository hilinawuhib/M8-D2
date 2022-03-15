import createError from "http-errors";
import atob from "atob";
import BlogsModel from "../services/blogposts/schema.js";
import AuthorsModel from "../services/authors/schema.js";

export const basicAuthMiddlewareAuthor = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createError(401, "Please provide credentials in Authorization header")
    );
  } else {
    const base64Credentials = req.headers.authorization.split(" ")[1];

    const [email, password] = atob(base64Credentials).split(":");

    const authors = await AuthorsModel.checkCredentials(email, password);

    if (authors) {
      req.author = authors;
      next();
    } else {
      next(createError(401, "Credentials are not OK!"));
    }
  }
};
export const basicAuthMiddlewareBlog = async (req, res, next) => {
 
  if (!req.headers.authorization) {
    next(
      createError(401, "Please provide credentials in Authorization header")
    );
  } else {
   
    const base64Credentials = req.headers.authorization.split(" ")[1];

    const [email,password] = atob(base64Credentials).split(":");

    const blog = await BlogsModel.checkCredentials(email,password);

    if (blog) {
      
      req.blog = blog;
      next();
    } else {
      
      next(createError(401, "Credentials are not OK!"));
    }
  }
};
