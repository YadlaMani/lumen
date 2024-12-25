import express from "express";
import { Request } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "./db";
import { ContentModel } from "./db";
import { userMiddleware } from "./middleware";
import "dotenv/config";
interface CustomRequest extends Request {
  userId?: string;
}
const app = express();
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
  await UserModel.create({ username, password });
  res.json({
    message: "User signed up",
  });
});
app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({
    username,
    password,
  });
  if (user) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET as string
    );
    res.json({
      message: "user signed in",
      token,
    });
  } else {
    res.status(401).json({
      message: "Invalid username or password",
    });
  }
});
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const title = req.body.title;
  const userId = (req as CustomRequest).userId;
  await ContentModel.create({
    link,
    title,
    userId,
    type: "article",
  });
  res.json({
    message: "content added",
  });
});
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  const userId = (req as CustomRequest).userId;

  const content = await ContentModel.find({ userId }).populate(
    "userId",
    "username"
  );
  res.json({
    content,
  });
});
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const userId = (req as CustomRequest).userId;
  const contentId = req.body.contentId;
  const content = await ContentModel.findById(contentId);

  if (content?.userId?.toString() == userId) {
    await ContentModel.findByIdAndDelete({ _id: contentId });
  }
  res.json({
    message: "content deleted",
  });
});
