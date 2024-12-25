import { model, Schema, Types } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const contentTypes = ["image", "video", "article", "audio"];
const ContentSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  link: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: "tags" }],
  userId: { type: Types.ObjectId, ref: "users", required: true },
});
export const UserModel = model("users", UserSchema);
export const ContentModel = model("content", ContentSchema);
