import express from "express";
import createHttpError from "http-errors";
import { basicAuthMiddleware } from "../../auth/basic.js";
import AuthorsModel from "./schema.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { authenticateAuthor } from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import passport from "passport";
const authorsRouter = express.Router();

authorsRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authors = await AuthorsModel.find();
      res.send(authors);
    } catch (error) {
      next(error);
    }
  }
);
authorsRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

authorsRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  (req, res, next) => {
    try {
      console.log(req.author.token);

      if (req.author.role === "Admin") {
        res.redirect(
          `${process.env.FE_URL}/admin?accessToken=${req.author.token}`
        );
      } else {
        res.redirect(
          `${process.env.FE_URL}/profile?accessToken=${req.author.token}`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.get(
  "/:authorId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authorId = req.params.authorId;
      const author = await AuthorsModel.findById(authorId);
      if (author) {
        res.send(author);
      } else {
        next(createHttpError(404, `author with id ${authorId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);
authorsRouter.post("/", async (req, res, next) => {
  try {
    const author = new AuthorsModel(req.body);
    const { _id } = await author.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
authorsRouter.put(
  "/:authorId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authorId = req.params.authorId;
      const author = await AuthorsModel.findByIdAndUpdate(authorId, req.body, {
        new: true,
      });
      if (author) {
        res.send(author);
      } else {
        next(createHttpError(404, `author with id ${authorId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);
authorsRouter.delete(
  "/:authorId",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authorId = req.params.authorId;
      const deletedAuthor = await AuthorsModel.findByIdAndDelete(authorId);
      if (deletedAuthor) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `author with id ${authorId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);
authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      const accessToken = await authenticateAuthor(author);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "crediential are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});
export default authorsRouter;
