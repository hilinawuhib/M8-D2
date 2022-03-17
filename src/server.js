import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import googleStrategy from "./auth/oauth.js"
import listEndpoints from "express-list-endpoints";
import passport from "passport"
import authorsRouter from "./services/authors/index.js";
import blogsRouter from "./services/blogposts/index.js";
import { unauthorizedHandler, forbiddenHandler, catchAllHandler } from "./errorHandlers.js"
const server = express();
const port = process.env.PORT || 3005;
passport.use("google", googleStrategy)
server.use(cors());
server.use(express.json());
server.use("/blogs", blogsRouter);
server.use("/authors",authorsRouter);
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

mongoose.connect(process.env.MONGO_CONNECTION);
mongoose.connection.on("connected", () => {
  console.log("successfully connected to mongo");
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("server running on port ", port);
  });
});
