"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrainModel = exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const contentTypes = ["image", "video", "article", "audio"];
const ContentSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    link: { type: String, required: true },
    tags: [{ type: mongoose_1.Types.ObjectId, ref: "tags" }],
    userId: { type: mongoose_1.Types.ObjectId, ref: "users", required: true },
});
const BrainScehma = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: "users", required: true },
    brain: [{ type: mongoose_1.Types.ObjectId, ref: "content" }],
    share: { type: Boolean, default: false },
});
exports.UserModel = (0, mongoose_1.model)("users", UserSchema);
exports.ContentModel = (0, mongoose_1.model)("content", ContentSchema);
exports.BrainModel = (0, mongoose_1.model)("brain", BrainScehma);
