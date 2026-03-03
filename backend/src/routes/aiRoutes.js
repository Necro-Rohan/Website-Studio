import express from 'express';
import { BlogGenerator, getBlogPost } from "../controllers/BlogGenerator.js";
import {verifyAdmin} from "../middlewares/adminVerification.js"

const router = express.Router()

router.post("/generate", verifyAdmin, BlogGenerator);

router.get("/blog/:slug", getBlogPost);

export default router;