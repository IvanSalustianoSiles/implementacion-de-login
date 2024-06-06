import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
mongoose.pluralize(null);

const usersCollection = "users_aggregate";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user", "premium"],
    default: "no-log",
  },
  grade: { type: Number, required: true },
  region: {
    type: String,
    enum: ["Cordoba", "Tucuman", "Mendoza", "Buenos Aires", "Rosario"],
    default: "Cordoba",
    required: true,
  },
});

userSchema.plugin(mongoosePaginate);

export const usersModel = mongoose.model(usersCollection, userSchema);
