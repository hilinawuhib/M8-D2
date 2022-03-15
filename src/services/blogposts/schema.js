import mongoose from "mongoose";
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
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],

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
blogSchema.static("findBlogsWithAuthors", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria);
  const blogs = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)
    .populate({
      path: "authors",
      select: "firstName lastName",
    });
  return { total, blogs };
});

export default model("blog", blogSchema);
