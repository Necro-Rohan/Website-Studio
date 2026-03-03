import express from 'express';
import { generateSitemap, generateLlmsTxt, generateRobotsTxt } from '../controllers/IndexingController.js';

const router = express.Router();

router.get('/sitemap.xml', generateSitemap);
router.get('/llms.txt', generateLlmsTxt);
router.get('/robots.txt', generateRobotsTxt);

export default router;