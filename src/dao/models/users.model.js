import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
mongoose.pluralize(null);

const usersCollection = "users";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
  },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  description: { type: String },
  age: { type: Number, required: true },
});

userSchema.plugin(mongoosePaginate);

export const usersModel = mongoose.model(usersCollection, userSchema);
