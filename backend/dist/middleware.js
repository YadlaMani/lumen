"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    if (header) {
        try {
            const decoded = jsonwebtoken_1.default.verify(header, "secret");
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
