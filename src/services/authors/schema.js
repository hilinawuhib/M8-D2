import mongoose from "mongoose";
import bcrypt from "bcrypt"

const { Schema, model } = mongoose;
const authorSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["author", "Admin"], default: "author" },
  },
  {
    timestamps: true,
  }
);

authorSchema.pre("save", async function (next) {
  const newAuthor = this;
  const plainPw = newAuthor.password;

  if (newAuthor.isModified("password")) {
    const hash = await bcrypt.hash(plainPw, 11);
    newAuthor.password = hash;
  }

  next();
});

authorSchema.methods.toJSON = function () {
  const authorDocument = this;
  const authorObject = authorDocument.toObject();

  delete authorObject.password;
  delete authorObject.__v;

  return authorObject;
};

authorSchema.statics.checkCredentials = async function (email, plainPW) {
  const author = await this.findOne({ email });

  if (author) {
    const isMatch = await bcrypt.compare(plainPW, author.password);

    if (isMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("author", authorSchema);
