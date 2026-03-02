import express from 'express';
import BlogGenerator from '../controllers/BlogGenerator.js';

const router = express.Router()

router.post("/generate", BlogGenerator)

export default router;