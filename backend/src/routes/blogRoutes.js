import express from 'express';
import { BlogGenerator, getBlogPost, getAllBlogPosts, updateBlogPost, deleteBlogPost } from "../controllers/BlogController.js";
import { verifyAdmin } from "../middlewares/adminVerification.js"
import { getHubData } from '../controllers/HubController.js';

const router = express.Router()

router.post("/generate", verifyAdmin, BlogGenerator);
router.patch("/update/:slug", verifyAdmin, updateBlogPost); 
router.delete("/delete/:slug", verifyAdmin, deleteBlogPost);

router.get("/blog/:slug", getBlogPost);

router.get("/blogs", getAllBlogPosts);
router.get("/hub/:type/:slug", getHubData);
export default router;