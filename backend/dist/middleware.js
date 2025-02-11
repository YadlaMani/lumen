"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
}
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    if (header) {
        try {
            const decoded = jsonwebtoken_1.default.verify(header, process.env.JWT_SECRET);
            if (decoded) {
                req.userId = decoded.id;
            }
        }
        catch (err) {
            console.error("Invalid token:", err);
        }
    }
    next();
};
exports.userMiddleware = userMiddleware;
