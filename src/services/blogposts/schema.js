import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema, model } = mongoose;
const blogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    authors: [{ type: Schema.Types.ObjectId, ref: "author" }],

    comment: [
      {
        name: { type: String },
        comment: { type: String },
      },
    ],
  },
  {
    content: { type: String, required: true },
    timestamps: true,
  }
);
blogSchema.pre("save", async function (next) {
  const newBlog = this;
  const plainPw = newBlog.authors.password;

  if (newBlog.isModified("authors.password")) {
    const hash = await bcrypt.hash(plainPw, 11);
    newBlog.authors.password = hash;
  }

  next();
});

blogSchema.methods.toJSON = function () {
  const blogDocument = this;
  const blogObject = blogDocument.toObject();

  delete blogObject.authors.password;
  delete blogObject.__v;

  return blogObject;
};

blogSchema.static("findBlogsWithAuthors", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria);
  const blogs = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)
    .populate({
      path: "authors",
      select: "firstName ,lastName,email,password,role",
    });
  return { total, blogs };
});
blogSchema.statics.checkCredentials = async function (authors, plainPW) {
  const blog = await this.findOne({ authors });

  if (blog) {
    const isMatch = await bcrypt.compare(plainPW, blog.authors.password);

    if (isMatch) {
      return blog;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("blog", blogSchema);
