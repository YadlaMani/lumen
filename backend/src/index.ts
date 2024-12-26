import express from "express";
import { Request } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "./db";
import { ContentModel } from "./db";
import { userMiddleware } from "./middleware";
import { BrainModel } from "./db";
import bcrypt from "bcrypt";
import Joi from "joi";
import validator from "validator";
const { genSaltSync, hashSync } = bcrypt;

import "dotenv/config";

interface CustomRequest extends Request {
  userId?: string;
}
const app = express();
const salt = genSaltSync(10);

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables.");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}
mongoose
  .connect(process.env?.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
app.use(express.json());
app.listen(5050, () => {
  console.log("Server is running on port 5050");
});
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 3) {
    res.status(411).json({
      message: "Username should be atleast length 3",
    });
  }
  if (!validatePassword(password)) {
    res.status(411).json({
      message:
        "Password should be 8 to 20 letters, should have atleast one uppercase, one lowercase, one special character, one number",
    });
  }
  try {
    const hashedPassword = hashSync(password, salt);
    await UserModel.create({ username, password: hashedPassword });
    res.status(200).json({
      message: "User signed up",
    });
  } catch (err) {
    res.status(403).json({
      message: "Username already exists/something went wrong",
    });
  }
});
app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({
    username,
  });
  const isValid = bcrypt.compareSync(password, user?.password as string);

  if (isValid) {
    const token = jwt.sign(
      {
        id: user?._id,
      },
      process.env.JWT_SECRET as string
    );
    res.json({
      message: "user signed in",
      token,
    });
  } else {
    res.status(403).json({
      message: "Invalid username or password",
    });
  }
});
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const title = req.body.title;
  if (title.length == 0) {
    res.status(411).json({
      message: "Title should not be empty",
    });
  }
  if (!validator.isURL(link)) {
    res.status(411).json({
      message: "Link should be a valid URL",
    });
  }
  try {
    const userId = (req as CustomRequest).userId;
    await ContentModel.create({
      link,
      title,
      userId,
      type: "article",
      tags: [],
    });
    res.json({
      message: "content added",
    });
  } catch (err) {
    res.status(403).json({
      message: err,
    });
  }
});
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;

    const content = await ContentModel.find({ userId }).populate(
      "userId",
      "username"
    );
    res.json({
      data: content,
    });
  } catch (err) {
    res.status(403).json({
      message: "something went wrong/invalid token header",
    });
  }
});
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const userId = (req as CustomRequest).userId;
  const contentId = req.body.contentId;
  if (!userId) {
    res.status(403).json({
      message: "Invalid token header",
    });
  }

  const content = await ContentModel.findById(contentId);
  if (content) {
    if (content?.userId?.toString() == userId) {
      await ContentModel.findByIdAndDelete({ _id: contentId });
    }
    res.json({
      message: "content deleted",
    });
  } else {
    res.status(403).json({
      message: "content not found",
    });
  }
});
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const userId = (req as CustomRequest).userId;
  if (userId) {
    const userContent = await ContentModel.find({ userId });

    const contentIds = userContent.map((content) => content._id);

    const newBrain = new BrainModel({
      userId,
      brain: contentIds,
      share: true,
    });
    await newBrain.save();
    res.status(200).json({
      message: "Brain created and can be shared",
      brain: newBrain,
    });
  } else {
    res.status(403).json({
      message: "something went wrong/invalid token header",
    });
  }
});
app.post("/api/v1/brain/:shareId", async (req, res) => {
  const shareId = req.params.shareId;
  const brain = await BrainModel.findById(shareId).populate("brain");
  if (brain) {
    res.json({
      data: brain,
    });
  } else {
    res.status(403).json({
      message: "Invalid share id",
    });
  }
});
function validatePassword(password: string) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

  if (passwordRegex.test(password)) {
    return true;
  } else {
    return false;
  }
}
