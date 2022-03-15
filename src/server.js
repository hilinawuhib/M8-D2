import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";

import authorsRouter from "./services/authors/index.js";
import blogsRouter from "./services/blogposts/index.js";

const server = express();
const port = process.env.PORT || 3005;

server.use(cors());
server.use(express.json());
server.use("/blogs", blogsRouter);
server.use("/authors",authorsRouter);

mongoose.connect(process.env.MONGO_CONNECTION);
mongoose.connection.on("connected", () => {
  console.log("successfully connected to mongo");
  server.listen(port, () => {
    console.log("server running on port ", port);
  });
});
