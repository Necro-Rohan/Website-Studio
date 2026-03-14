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
  let formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  let formattedGeography = geography.charAt(0).toUpperCase() + geography.slice(1).toLowerCase();
  const seoAdjective = formattedAdjective;
  const keyword = `${seoAdjective} Website Builder for ${formattedCategory} in ${formattedGeography}`;

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
  12. Managing your business on-the-go: The power of mobile admin apps.
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
  1. **HEADING HIERARCHY & NO MAIN TITLE:** Do NOT write an overall title or headline for the blog. Our system already handles the H1. Start the HTML immediately with the heading for Section 1. Every single one of the 15 main outline sections MUST be wrapped in an <h2> tag. Any subheadings you create inside those sections MUST be wrapped in an <h3> tag.
  2. **NO CONVERSATIONAL FILLER:** You must return ONLY raw HTML code. DO NOT start with "Here is your article". DO NOT end with "This article meets all requirements". Start immediately with the first <h2> tag and end with the final HTML closing tag.
  3. **STRICTLY RAW HTML (NO MARKDOWN):** You are strictly forbidden from using markdown. DO NOT use '#' for headings or '**' for bold text. Use ONLY raw HTML tags: <h2>, <h3>, <p>, <strong>, <ul>, and <li>. 
  4. **TONE & LINKS (MELLOWED DOWN):** Maintain an objective, consultative, and professional tone. Position Websites.co.in as the smartest, most efficient choice for local businesses, but DO NOT aggressively bash competitors. You MUST naturally insert this exact link EXACTLY 2 or 3 times (no more) TOTAL across all 15 sections combined: <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Websites.co.in</a>. **CRITICAL: DO NOT insert this link in every section. The absolute maximum number of links in your entire 4000-word output is 3. Mention the brand ONLY in the competitor comparison and the conclusion. Do NOT link to the brand in the introduction or the middle of the article. This will look unnatural and hurt SEO.**
  5. **RICH UI/UX FORMATTING (TABLES & QUOTES):** You must break up the wall of text to make it readable. 
     - **CRITICAL: In Section 10 (Competitors), you MUST create a beautifully formatted HTML comparison table using Tailwind classes (e.g., <table class="w-full text-left border-collapse border border-slate-200 my-6">, <th class="bg-slate-100 p-4">, <td class="p-4 border-b">).**
     - **CRITICAL: Use visually distinct pull-quotes for key statistics using: <blockquote class="border-l-4 border-blue-500 pl-4 italic text-slate-700 my-8 text-lg">Your quote here</blockquote>**
     - **CRITICAL: Wrap formulas or case studies in: <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 my-6 shadow-sm"><p class="text-slate-700 font-medium">Text</p></div>**
  6. **EXTREME ANTI-LAZINESS RULE:** You must write at least 3 FULL paragraphs (300+ words) for EVERY single section. Sections 11, 12, 13, and 14 MUST be just as long and detailed as Section 1. Do not summarize or rush the end of the article.
    - **EXCEPTION FOR SECTION 15 (FAQs):** Do NOT write generic paragraphs about FAQs. You MUST write exactly 12 individual Questions and detailed Answers. Format each Question in an <h3> tag and each Answer in a <p> tag. **CRITICAL: Each of the 12 Answers MUST be a robust, comprehensive paragraph of at least 60 to 100 words (4+ sentences). Do NOT give one-sentence answers.**
  7. **TOKEN INJECTION (MANDATORY):** You MUST insert the following exact text tokens on their own line within the article. Do not modify these tokens in any way. If you miss a token, the system will crash.
     - Insert ***IMAGE_1*** after the first paragraph of Section 1.
     - Insert ***IMAGE_2*** after the first paragraph of Section 3.
     - Insert ***IMAGE_3*** after the first paragraph of Section 6.
     - Insert ***IMAGE_4*** after the first paragraph of Section 9.
     - Insert ***IMAGE_5*** after the first paragraph of Section 12.
     - Insert ***CTA_LINK*** at the very end of Section 7.
     - Insert ***CTA_LINK*** at the very end of Section 15.`;

  const response = await openrouter.chat.completions.create({
    model: "deepseek/deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8000,
  });

  // Fallback cleaner to strip any accidental markdown blocks
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
  console.log("4. Generating a mix of AI and Real Stock Images...");

  // The 5 specific image intents
  const imageConfigs = [
    { type: "unsplash", query: `${category} building ${geography}` }, // Real city photo
    {
      type: "flux",
      prompt: `A clean website builder dashboard interface showing analytics for a ${category}, highly realistic UI`,
    }, // AI UI Dashboard
    { type: "unsplash", query: `professional working ${category}` }, // Real person working
    {
      type: "flux",
      prompt: `A minimalist UI graphic showing local SEO growth and web design tools for ${category}`,
    }, // AI Abstract Graphic
    { type: "unsplash", query: `business analytics dashboard success` }, // Real computer/growth photo
  ];

  const generateFluxImage = async (promptText) => {
    const imageBlob = await hfClient.textToImage({
      provider: "nscale",
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: promptText,
      parameters: { num_inference_steps: 4 },
    });
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  };

  // for maximum speed
  const imagePromises = imageConfigs.map(async (config, index) => {
    try {
      if (config.type === "flux") {
        console.log(`Generating AI Image ${index + 1}/5 (FLUX)...`);
        return await generateFluxImage(config.prompt);
      }

      if (config.type === "unsplash") {
        console.log(`Fetching Real Image ${index + 1}/5 (Unsplash)...`);
        try {
          const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(config.query)}&orientation=landscape&per_page=10&content_filter=high&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
          const response = await fetch(unsplashUrl);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Unsplash Failed: ${response.status} - ${errorText}`,
            );
          }

          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Picking a random image from the Top 10 most relevant results
            const topPhotos = data.results;
            const randomTopPhoto = topPhotos[Math.floor(Math.random() * topPhotos.length)];
            return randomTopPhoto.urls.regular;
          } else {
             throw new Error("Unsplash returned 0 results for this query.");
          }
        } catch (unsplashError) {
          // CASCADING FALLBACK 
          console.warn(
            `Unsplash failed for Image ${index + 1} (${unsplashError.message}). Falling back to FLUX...`,
          );

          const fallbackPrompt = `Highly realistic, cinematic photography of ${config.query}, 8k resolution, photorealistic`;
          return await generateFluxImage(fallbackPrompt);
        }
      }
    } catch (criticalError) {
      console.error(`CRITICAL FAILURE for Image ${index + 1}:`, criticalError.message);
      // Ultimate Failsafe: If BOTH Unsplash and Hugging Face are completely down, 
      return `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80`;
    }
  });

  // Wait for all images to finish at the exact same time
  const imageUrls = await Promise.all(imagePromises);
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