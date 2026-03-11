import { GoogleGenAI } from "@google/genai"; 
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

export async function generateSEOContent(adjective, category, geography) {
  // Yeh apna master prompt hai. Kartik sir ne templates, buttons, aur 
  // features mention karne bola tha jaisa top ranking sites karti hain.
  const prompt = `
  You are an expert SEO copywriter and conversion rate optimization (CRO) specialist working for "Websites.co.in", a top-tier website builder platform.

  Your task is to write a highly optimized, long-form programmatic SEO blog post.
  Target Keyword: ${adjective} Website Builder for ${category} in ${geography}

  **CONTENT REQUIREMENTS & WINNING FORMULA:**
  1. **Introduction:** Hook the reader. Acknowledge the specific challenges of running a ${category} business in ${geography} and why having a professional website is crucial for local SEO.
  2. **Niche-Specific Benefits:** Explain exactly what features a ${category} needs (e.g., if Salon: booking widgets, service menus. If Plumber: quote forms, emergency call buttons, testimonials).
  3. **Template Showcase (Crucial):** Describe 3 distinct, beautiful website templates perfect for a ${category} (e.g., "The Modern Minimalist", "The Classic Professional", etc.). After describing EACH template, add a Call-To-Action (CTA) button placeholder.
  4. **The "How-To" Section:** Include a simple 3-step guide on how to launch their ${category} website today using Websites.co.in.
  5. **Self-Promotion:** Seamlessly position "Websites.co.in" as the ultimate, easiest, and most affordable solution for this specific niche. 

  **HTML FORMATTING RULES:**
  - Output the content ENTIRELY in clean HTML (do not include markdown ticks like \`\`\`html).
  - STRICT RULE: NEVER use an <h1> tag inside the htmlContent. The main title is already handled on the frontend. 
  - Start your content directly with an introductory paragraph, and use ONLY <h2> and <h3> tags for your subheadings to maintain a strong hierarchical structure.
  - Use <ul> and <li> for benefits and features to make it skimmable.
  - For EVERY button/CTA, use this exact HTML structure: 
    <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg my-4 inline-block text-center hover:bg-blue-700 transition">Start Building Your ${category} Website Now</a>

  **OUTPUT FORMAT:**
  You must return ONLY a strict JSON object with the following keys. No conversational text before or after.
  {
    "slug": "seo-friendly-url-slug-using-the-keyword",
    "metaTitle": "SEO title under 60 characters",
    "metaDescription": "Compelling meta description under 155 characters",
    "h1": "Catchy main headline containing the exact keyword",
    "htmlContent": "<div>...full HTML content following the rules above...</div>"
  }
  `;

  try {
    // responseMimeType JSON rakhna zaroori hai warna API text de degi aur code crash ho skta hai
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    
    // JSON parse karke bhej raha hoon taaki backend sidha save kar sake
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini AI Generation Error:", error);
    throw new Error("Failed to generate AI content");
  }
}

