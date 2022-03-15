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
    author: { type: Schema.Types.ObjectId, required: true, ref: "Authors" },

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

  delete blogObject.author.password;
  delete blogObject.__v;

  return blogObject;
};

blogSchema.statics.checkCredentials = async function (author, plainPW) {
  const blog = await this.findOne({ author });

  if (blog) {
    const isMatch = await bcrypt.compare(plainPW, blog.author.password);

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
