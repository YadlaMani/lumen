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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const db_2 = require("./db");
const middleware_1 = require("./middleware");
const db_3 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const { genSaltSync, hashSync } = bcrypt_1.default;
require("dotenv/config");
const app = (0, express_1.default)();
const salt = genSaltSync(10);
if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
}
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
}
mongoose_1.default
    .connect((_a = process.env) === null || _a === void 0 ? void 0 : _a.MONGO_URI)
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
    if (username.length < 3) {
        res.status(411).json({
            message: "Username should be atleast length 3",
        });
    }
    if (!validatePassword(password)) {
        res.status(411).json({
            message: "Password should be 8 to 20 letters, should have atleast one uppercase, one lowercase, one special character, one number",
        });
    }
    try {
        const hashedPassword = hashSync(password, salt);
        yield db_1.UserModel.create({ username, password: hashedPassword });
        res.status(200).json({
            message: "User signed up",
        });
    }
    catch (err) {
        res.status(403).json({
            message: "Username already exists/something went wrong",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield db_1.UserModel.findOne({
        username,
    });
    const isValid = bcrypt_1.default.compareSync(password, user === null || user === void 0 ? void 0 : user.password);
    if (isValid) {
        const token = jsonwebtoken_1.default.sign({
            id: user === null || user === void 0 ? void 0 : user._id,
        }, process.env.JWT_SECRET);
        res.json({
            message: "user signed in",
            token,
        });
    }
    else {
        res.status(403).json({
            message: "Invalid username or password",
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const title = req.body.title;
    if (title.length == 0) {
        res.status(411).json({
            message: "Title should not be empty",
        });
    }
    if (!validator_1.default.isURL(link)) {
        res.status(411).json({
            message: "Link should be a valid URL",
        });
    }
    try {
        const userId = req.userId;
        yield db_2.ContentModel.create({
            link,
            title,
            userId,
            type: "article",
            tags: [],
        });
        res.json({
            message: "content added",
        });
    }
    catch (err) {
        res.status(403).json({
            message: err,
        });
    }
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const content = yield db_2.ContentModel.find({ userId }).populate("userId", "username");
        res.json({
            data: content,
        });
    }
    catch (err) {
        res.status(403).json({
            message: "something went wrong/invalid token header",
        });
    }
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.userId;
    const contentId = req.body.contentId;
    if (!userId) {
        res.status(403).json({
            message: "Invalid token header",
        });
    }
    const content = yield db_2.ContentModel.findById(contentId);
    if (content) {
        if (((_a = content === null || content === void 0 ? void 0 : content.userId) === null || _a === void 0 ? void 0 : _a.toString()) == userId) {
            yield db_2.ContentModel.findByIdAndDelete({ _id: contentId });
        }
        res.json({
            message: "content deleted",
        });
    }
    else {
        res.status(403).json({
            message: "content not found",
        });
    }
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (userId) {
        const userContent = yield db_2.ContentModel.find({ userId });
        const contentIds = userContent.map((content) => content._id);
        const newBrain = new db_3.BrainModel({
            userId,
            brain: contentIds,
            share: true,
        });
        yield newBrain.save();
        res.status(200).json({
            message: "Brain created and can be shared",
            brain: newBrain,
        });
    }
    else {
        res.status(403).json({
            message: "something went wrong/invalid token header",
        });
    }
}));
app.post("/api/v1/brain/:shareId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shareId = req.params.shareId;
    const brain = yield db_3.BrainModel.findById(shareId).populate("brain");
    if (brain) {
        res.json({
            data: brain,
        });
    }
    else {
        res.status(403).json({
            message: "Invalid share id",
        });
    }
}));
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (passwordRegex.test(password)) {
        return true;
    }
    else {
        return false;
    }
}
