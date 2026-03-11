import { GoogleGenAI } from "@google/genai";
import { InferenceClient } from "@huggingface/inference";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();


const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const githubAI = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

const hfClient = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function generateSEOContentPipeline(adjective, category, geography) {
  let formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase();
  const seoAdjective = formattedAdjective;
  const keyword = `${seoAdjective} Website Builder for ${category} in ${geography}`;

  try {
    console.log("1. Generating 13-Section Megaprompt Outline...");
    const outline = await generateOutline(keyword, category, geography);

    console.log("2. Generating 3500+ Word HTML Article with DeepSeek V3...");
    const articleHtml = await generateArticle(keyword, outline, category, geography);

    console.log("3. Generating SEO Metadata with GPT-4o...");
    const seoData = await generateSEOTags(keyword, outline);

    console.log("4. Generating 5 Images with FLUX...");
    const images = await generateImages(category, geography);

    console.log("5. Assembling Final HTML & Alt Tags...");
    const finalHtml = assembleFinalHtml(articleHtml, images, category, geography);

    return {
      slug: seoData.slug,
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      h1: seoData.h1,
      htmlContent: finalHtml,
    };
  } catch (error) {
    console.error("Pipeline Error:", error);
    throw new Error("Failed to execute multi-model pipeline");
  }
}


async function generateOutline(keyword, category, geography) {
  const prompt = `You are an Enterprise SEO Architect. Create a massive 15-section SEO blog outline for the keyword: "${keyword}". 
  Target Audience: ${category} businesses operating in ${geography}.
  
  The outline MUST include these exact 15 sections to ensure a 4000-word length:
  1. Introduction (Deep local market context for ${geography}).
  2. Future Trends in the ${geography} ${category} Industry (Mobile-first discovery).
  3. Why Digital Transformation is Mandatory for ${category}s.
  4. The Cost of Not Having a Website (Lost revenue).
  5. Common Website Mistakes ${category} Owners Make (Slow loading, missing booking systems).
  6. How a Website Helps ${category}s Convert Visitors into Members (Lead capture, online payments).
  7. Top 5 Features Every ${category} Website Needs.
  8. Real Case Scenarios: How a Website Increased Revenue for a ${category} by 40%.
  9. Benefits of Using a Website Builder vs Hiring a Developer (Cost, time, maintenance).
  10. Competitor Comparison: Wix (Requires premium for bookings), WordPress (Plugin conflicts, security issues), Shopify (Expensive, e-commerce focused), Squarespace, and GoDaddy.
  11. Why Websites.co.in is the Ultimate Solution: Detail Free SSL, Free Domain, Hosting, WhatsApp/Live Chat, Google Analytics, Hotjar, and Auto-SEO.
  12. How to manage your business on-the-go using the Websites.co.in Android App.
  13. Step-by-Step Guide: Launching your ${category} website in 15 minutes.
  14. Local SEO Strategies for ${category}s in ${geography} (Automated with Websites.co.in).
  15. Top 12 Frequently Asked Questions (FAQs) including booking integrations and Google rankings.

  Return ONLY the text outline.`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

async function generateArticle(keyword, outline, category, geography) {
  const prompt = `You are a Master SEO Content Writer. Write a massive, comprehensive article based exactly on this 15-section outline:
  
  ${outline}
  
  **CRITICAL RULES (FAILURE MEANS REJECTION):**
  1. **NO CONVERSATIONAL FILLER:** You must return ONLY raw HTML code. DO NOT start with "Here is your article". DO NOT end with "This article meets all requirements". Start immediately with the first <h2> tag and end with the final HTML closing tag.
  2. **STRICTLY RAW HTML (NO MARKDOWN):** You are strictly forbidden from using markdown. DO NOT use '#' for headings or '**' for bold text. Use ONLY raw HTML tags: <h2>, <h3>, <p>, <strong>, <ul>, and <li>. 
  3. **EXTREME ANTI-LAZINESS RULE:** You must write at least 3 FULL paragraphs (300+ words) for EVERY single section. Sections 11, 12, 13, 14, and 15 MUST be just as long and detailed as Section 1. Do not summarize or rush the end of the article.
  4. **UI/UX FORMATTING:** Make the content easy to read. Wrap formulas, statistics, or case studies in this exact HTML block: 
     <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 my-6 shadow-sm"><p class="text-slate-700 font-medium">Your text here</p></div>
  5. **MANDATORY LINKS & RESTRICTIONS:** You MUST use this exact HTML link naturally within paragraphs at least 6 times throughout the article: <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Websites.co.in</a>. NEVER link to competitors or external websites. Only link to Websites.co.in.
  
  **TOKEN INJECTION (MANDATORY):**
  Instead of writing HTML for images and buttons, you MUST insert these exact text tokens on their own line so our backend can replace them later. Do not modify these tokens:
  
  Insert these evenly throughout the text:
  ***IMAGE_1***
  ***IMAGE_2***
  ***IMAGE_3***
  ***IMAGE_4***
  ***IMAGE_5***
  
  Insert this token at the end of sections 4, 8, 11, and 15:
  ***CTA_LINK***`;

  const response = await openrouter.chat.completions.create({
    model: "deepseek/deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8000,
  });

  // A quick fallback cleaner just in case it still adds markdown code block wrappers
  let content = response.choices[0].message.content;
  content = content
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();

  return content;
}

async function generateSEOTags(keyword, outline) {
  const prompt = `Based on keyword: "${keyword}", generate optimized SEO metadata.
  Return ONLY a raw JSON object:
  {
    "slug": "best-website-builder-for-exact-category-in-exact-city",
    "metaTitle": "SEO title under 60 chars containing keyword",
    "metaDescription": "Compelling description under 155 chars highlighting Websites.co.in",
    "h1": "Catchy main headline containing keyword"
  }`;

  const response = await githubAI.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function generateImages(category, geography) {
  console.log("Generating 5 Images with FLUX via Hugging Face Inference...");
  
  const prompts = [
    `A professional modern ${category} business exterior operating in ${geography}, highly realistic`,
    `A clean website builder dashboard interface showing analytics for a ${category}`,
    `A business owner in ${geography} managing a ${category} website on a modern smartphone`,
    `A highly professional local ${category} service helping customers`,
    `A minimalist UI graphic showing SEO growth, Google Analytics, and web design tools`
  ];

  const imageUrls = [];

  for (let i = 0; i < prompts.length; i++) {
    try {
      console.log(`Generating image ${i + 1}/5...`);
      const imageBlob = await hfClient.textToImage({
        provider: "nscale", 
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompts[i],
        parameters: { num_inference_steps: 4 }, // FLUX.1 Schnell is optimized for 4 steps
      });

      // Converting the Blob into a Base64 string for direct HTML embedding
      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      
      imageUrls.push(base64Image);
      
    } catch (error) {
      console.error(`Hugging Face Image ${i + 1} Error:`, error.message);
      // Failsafe: If one image fails, use a beautiful Unsplash placeholder 
      // so your entire 60-second pipeline doesn't crash just because of one image.
      const fallbackSearch = i === 1 || i === 4 ? 'analytics,dashboard' : `${category},business`;
      imageUrls.push(`https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80`);
    }
  }

  return imageUrls;
}

function assembleFinalHtml(html, images, category, geography) {
  let finalHtml = html;
  
  // INJECTING THE IMAGES AND ALT TAGS
  const seoAltTags = [
    `Modern ${category} exterior in ${geography} attracting new members`,
    `Websites.co.in website builder dashboard for ${category} business management`,
    `${category} owner in ${geography} managing business website using Websites.co.in Android app`,
    `Local ${category} service business website example built using Websites.co.in`,
    `Advanced local SEO optimization and Google Analytics integration for ${category}s`
  ];

  images.forEach((imgUrl, index) => {
    const imgElement = `
      <figure class="my-12">
        <img src="${imgUrl}" alt="${seoAltTags[index]}" class="w-full h-auto rounded-2xl shadow-xl object-cover border border-slate-200" loading="lazy" />
        <figcaption class="text-center text-sm font-medium text-slate-500 mt-4">${seoAltTags[index]}</figcaption>
      </figure>
    `;
    finalHtml = finalHtml.replace(`***IMAGE_${index + 1}***`, imgElement);
  });

// THE EXACT HYPERLINKS (Guarantees the URL is present for the SEO audit)
  const ctaElement = `
    <div class="text-center my-12 bg-blue-50 p-8 rounded-2xl border border-blue-100">
      <h3 class="text-2xl font-bold text-slate-900 mb-4">Ready to grow your ${category} in ${geography}?</h3>
      <p class="text-slate-600 mb-6">Avoid expensive website builders. Get a free domain, hosting, and SEO tools included in one platform.</p>
      <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" class="bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition block sm:inline-block">
        Create your website instantly with Websites.co.in
      </a>
    </div>
  `;

  // Replacing all instances of the CTA token with our perfect HTML block
  finalHtml = finalHtml.split('***CTA_LINK***').join(ctaElement);

  return finalHtml;
}