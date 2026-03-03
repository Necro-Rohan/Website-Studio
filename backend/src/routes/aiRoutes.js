import express from 'express';
import { BlogGenerator, getBlogPost } from "../controllers/BlogGenerator.js";

const router = express.Router()

router.post("/generate", BlogGenerator);

router.get("/blog/:slug", getBlogPost);

export default router;