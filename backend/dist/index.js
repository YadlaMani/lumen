"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const db_2 = require("./db");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
mongoose_1.default
    .connect("mongodb+srv://mani:ymn336699@cluster0.bb7kjwa.mongodb.net/lumen")
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
app.use(express_1.default.json());
app.listen(5050, () => {
    console.log("Server is running on port 5050");
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    yield db_1.UserModel.create({ username, password });
    res.json({
        message: "User signed up",
    });
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield db_1.UserModel.findOne({
        username,
        password,
    });
    if (user) {
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
        }, "secret");
        res.json({
            message: "user signed in",
            token,
        });
    }
    else {
        res.status(401).json({
            message: "Invalid username or password",
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const title = req.body.title;
    const userId = req.userId;
    yield db_2.ContentModel.create({
        link,
        title,
        userId,
        type: "article",
    });
    res.json({
        message: "content added",
    });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const content = yield db_2.ContentModel.find({ userId }).populate("userId", "username");
    res.json({
        content,
    });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.userId;
    const contentId = req.body.contentId;
    const content = yield db_2.ContentModel.findById(contentId);
    if (((_a = content === null || content === void 0 ? void 0 : content.userId) === null || _a === void 0 ? void 0 : _a.toString()) == userId) {
        yield db_2.ContentModel.findByIdAndDelete({ _id: contentId });
    }
    res.json({
        message: "content deleted",
    });
}));
