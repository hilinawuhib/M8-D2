import express from "express";
import createHttpError from "http-errors";
import BlogsModel from "./schema.js";
import CommentsModel from "../comments/schema.js";
import q2m from 'query-to-mongo';

const blogsRouter = express.Router();

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogsModel.find();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;

    const blog = await BlogsModel.findById(blogId);
    if (blog) {
      res.send(blog);
    } else {
      next(createHttpError(404, `blog with id ${blogId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const updatedBlog = await BlogsModel.findByIdAndUpdate(blogId, req.body, {
      new: true,
    });
    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(createHttpError(404, `blog with id ${blogId} not found!`));
    }
  } catch (error) {{
    
  }
    next(error);
  }
});



//blogs with comments

blogsRouter.get("/:blogId/comment", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (blog) {
      res.send(blog.comment);
    } else {
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
blogsRouter.get("/:blogId/comment/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.blogId} is not found!` });
    } else {
      const commentIndex = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (commentIndex === -1) {
        res.status(404).send({
          message: `comment with ${req.params.commentId} is not found!`,
        });
      } else {
        blog.comments[commentIndex] = {
          ...blog.comments[commentIndex]._doc,
          ...req.body,
        };
        await blog.save();
        res.status(204).send();
      }
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.post("/:blogId/comment", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.blogId} is not found!` });
    } else {
      const newBlog = await BlogsModel.findByIdAndUpdate(
        req.params.blogId,
        { $push: { comment: req.body } },
        { new: true }
      );
      res.send(newBlog);
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId/comment/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.blogId} is not found!` });
    } else {
      const commentIndex = blog.comment.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (commentIndex === -1) {
        res.status(404).send({
          message: `comment with ${req.params.commentId} is not found!`,
        });
      } else {
        blog.comment[commentIndex] = {
          ...blog.comment[commentIndex]._doc,
          ...req.body,
        };
        await blog.save();
        res.status(204).send();
      }
    }
  } catch (error) {
    console.log(error);
    res.send(500).send({ message: error.message });
  }
});
blogsRouter.delete("/:blogId/comment/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.blogId} is not found!` });
    } else {
      await BlogsModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            comment: { _id: req.params.commentId },
          },
        },
        { new: true }
      );
      res.status(204).send();
    }
  } catch (error) {
    console.log(error);
    res.send(500).send({ message: error.message });
  }
});

blogsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { total, blog } = await BlogsModel.findBooksWithAuthors(mongoQuery);
    res.send({
      links: mongoQuery.links("/blog", total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      books,
    });
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId).populate({
      path: "authors",
      select: "firstName lastName",
    });
    if (blog) {
      res.send(blog);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
