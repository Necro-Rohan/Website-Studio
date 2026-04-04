import express from "express";
import { renderSeoBlogPage } from "../controllers/SeoController.js";

const router = express.Router();

// Hub Pages (Added so SeoController can intercept them!)
router.get("/blog/category/:slug", renderSeoBlogPage);
router.get("/blog/location/:slug", renderSeoBlogPage);

// SEO-Optimized Blog Post Pages
router.get("/blog/:slug", renderSeoBlogPage);


export default router;
