import { GoogleGenAI } from "@google/genai";
// import { InferenceClient } from "@huggingface/inference";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const githubAI = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

// const hfClient = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function generateSEOContentPipeline(adjective, category, geography) {
  let formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase();
  let formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  let formattedGeography = geography.charAt(0).toUpperCase() + geography.slice(1).toLowerCase();
  const seoAdjective = formattedAdjective;
  const keyword = `${seoAdjective} Website Builder for ${formattedCategory} in ${formattedGeography}`;

  try {
    console.log("1. Generating 13-Section Megaprompt Outline...");
    const outline = await generateOutline(keyword, category, geography);

    console.log("2. Generating 3500+ Word HTML Article...");
    const articleHtml = await generateArticle(keyword, outline, category, geography);

    console.log("3. Generating SEO Metadata with GPT-4o...");
    const seoData = await generateSEOTags(keyword, outline);

    console.log("4. Generating a mix of AI and Real Stock Images...");
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


const uploadBufferToCloudinary = async (buffer, folderName = "pseo_blogs") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        format: "webp", // Force webp to save massive amounts of storage!
        quality: "auto", // Cloudinary AI optimizes the size without losing quality
      },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      },
    );
    uploadStream.end(buffer);
  });
};


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
    model: "gemini-3.1-flash-lite-preview", // we will use model gemini-2.5-flash in production
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
  4. **TONE & LINKS (MELLOWED DOWN):** Maintain an conversational, and energetic tone. Position Websites.co.in as the smartest, most efficient choice for local businesses, but DO NOT aggressively bash competitors. You MUST naturally insert this exact link EXACTLY 2 or 3 times (no more) TOTAL across all 15 sections combined: <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Websites.co.in</a>. **CRITICAL: DO NOT insert this link in every section. The absolute maximum number of links in your entire 4500-word output is 3. Mention the brand ONLY in the competitor comparison and the conclusion. Do NOT link to the brand in the introduction or the middle of the article. This will look unnatural and hurt SEO.**
  5. **RICH UI/UX FORMATTING (TABLES & QUOTES):** You must break up the wall of text to make it readable. 
     - **CRITICAL: In Section 10 (Competitors), you MUST create a 4-column comparison table.**
       - Columns MUST exactly be: "Platform", "Best For", "Biggest Drawback", and "Verdict for ${category}".
       - Write exactly 1 sentence per cell (minimum 10 words,no one-word answers, no massive paragraphs).
       - You MUST use this exact HTML wrapper for mobile responsiveness:
         <div class="overflow-x-auto my-8 border border-slate-200 rounded-xl shadow-sm"><table class="w-full text-left border-collapse min-w-[600px]"><thead class="bg-slate-50 border-b border-slate-200"><tr><th class="p-4 font-semibold text-slate-900">Platform</th>...</tr></thead><tbody><tr class="border-b border-slate-100 hover:bg-slate-50"><td class="p-4 align-top">...</td>...</tr>...</tbody></table></div>
     - **CRITICAL: Use visually distinct pull-quotes for key statistics using: <blockquote class="border-l-4 border-blue-600 bg-blue-50 p-6 italic text-slate-700 my-8 text-xl rounded-r-lg shadow-sm">Your quote here</blockquote>**
     - **CRITICAL: Wrap formulas or case studies in: <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 my-6 shadow-sm"><p class="text-slate-700 font-medium">Text</p></div>**
  6. **EXTREME ANTI-LAZINESS RULE:** You must write at least 3 full paragraphs for each section.Each paragraph should be approximately 60-100 words. Sections 11, 12, 13, and 14 MUST be just as long and detailed as Section 1. Do not summarize or rush the end of the article.
    - **EXCEPTION FOR SECTION 15 (FAQs):** Do NOT write generic paragraphs about FAQs. You MUST write exactly 12 individual Questions and detailed Answers. Format each Question in an <h3> tag and each Answer in a <p> tag. **CRITICAL: Each answer must be 80-100 words. Answers must include practical, real-world examples relevant to the business category and city.Do NOT give one-sentence answers.use of <strong>important phrases</strong> and <i>emphasis text</i>**
  7. **TOKEN INJECTION (MANDATORY):** You MUST insert the following exact text tokens on their own line within the article. Do not modify these tokens in any way. If you miss a token, the system will crash.
     - Insert ***IMAGE_1*** after the first paragraph of Section 1.
     - Insert ***IMAGE_2*** after the first paragraph of Section 3.
     - Insert ***IMAGE_3*** after the first paragraph of Section 6.
     - Insert ***IMAGE_4*** after the first paragraph of Section 9.
     - Insert ***IMAGE_5*** after the first paragraph of Section 12.
     - Insert ***CTA_LINK*** at the very end of Section 7.
     - Insert ***CTA_LINK*** at the very end of Section 15.  
  8. **SNAPPY, HUMAN TONE:** Write like a modern tech blogger (think HubSpot or Intercom). Be punchy, conversational, and energetic. DO NOT use robotic transition sentences like "Moving on to..." or "Building upon...". Start sections with a bold claim, a short question, or a startling fact. Use real-world examples and case studies to illustrate points. Avoid repeating the same sentence structures. Use varied phrasing and formatting to keep the reader engaged. DO NOT be overly formal or technical. The tone should be consultative and approachable, like you're advising a friend who owns a local business.
    Follow these rules:
    • Paragraphs should be 60-100 words.
    • Avoid large blocks of uninterrupted text.
    • Use <ul><li> lists to summarize key ideas when explaining multiple points.
    • Lists should contain 3-6 items.
    • Every section must include at least one readability element:
      - bullet list
      - pull quote
      - highlighted insight box
      - short subheading (<h3>)
      - use of <strong>important phrases</strong> or <i>emphasis text</i>
      - strictly no use of markdown formatting like bold or italics symbols. Use HTML tags only.
    • Never write more than 3 consecutive lines without a paragraph break or formatting element.
9. **KILL THE WALL OF TEXT (CRITICAL):** Internet users scan, they don't read. **Paragraphs must be a maximum of 2 to 3 sentences.** Use frequent line breaks. Use bulleted lists (<ul><li class="mb-2">) to break up data. Bold **key phrases** to make scanning easy.  
10. **WRITING STYLE & VOICE (THE "ANTI-AI" PROTOCOL):**
    • Write in a snappy, modern editorial style (think HubSpot, Intercom, or Stripe).
    • Speak directly to the reader using "you" and "your". Be consultative and authoritative.
    • Use active voice, strong verbs, and varied sentence lengths.
    • **NO ROBOTIC TRANSITIONS:** Do not start sections by summarizing the previous section. Start every new H2 section with a bold statement, a practical question, or a startling fact.
    • **BANNED AI PHRASES (CRITICAL):** You are strictly forbidden from using cliché AI filler words. Do NOT use: "Furthermore," "In today's digital landscape," "Delve into," "Navigating," "In conclusion," "It's no secret that," "Testament to," or "At the end of the day."
    • **NO MARKDOWN:** Strictly avoid using markdown formatting. Use HTML tags for all formatting needs.
`;

  const response = await genAI.models.generateContent({
    model: "gemini-3.1-flash-lite-preview", // we will use model gemini-2.5-flash in production
    // othermodel:- "gemini-3.1-flash-lite-preview"
    contents: prompt,
  });
  let content =response.text;

  // Fallback cleaner to strip any accidental markdown blocks
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

  // const response = await genAI.models.generateContent({
  //   model: "gemini-2.5-flash-lite", // Maybe, we will use model upper commented one in production
  //   contents: prompt,
  //   // This config explicitly tells Gemini to only return valid JSON
  //   config: {
  //     responseMimeType: "application/json",
  //   },
  // });

  // let content = response.text;

  // content = content
  //   .replace(/```json/gi, "")
  //   .replace(/```/g, "")
  //   .trim();

  // return JSON.parse(content);
}


async function generateImages(category, geography) {
  // THE DOOMSDAY SHIELD 
  const getEmergencyImage = async (index) => {
    const dynamicFallbacks = [
      `${category} website on laptop`,
      `modern ${category} business`,
      `${category} professional helping customer`,
      `business growth charts and graphs`, 
      `business analytics dashboard laptop screen`,
    ];

    const staticFallbacks = [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
      "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=800&q=80&auto=format&fit=crop",
    ];

    console.log(`Activating Smart Shield for Image ${index + 1}...`);

    // Dynamic prompt first!
    const targetPrompt = dynamicFallbacks[index] || `${category} business`;
    const dynamicImg = await fetchUnsplashImage(targetPrompt);

    if (dynamicImg) return dynamicImg;

    // return the guaranteed static URL
    console.warn(
      `Smart Shield dynamic fetch failed. Using hardcoded stock URL.`,
    );
    return staticFallbacks[index % staticFallbacks.length];
  };

  // REUSABLE UNSPLASH MATCHER FOR BOTH PRIMARY AND SMART SHIELD
  const fetchUnsplashImage = async (searchQuery) => {
    try {
      // We ask for 15 results so we can pick a random one!
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=15&content_filter=high&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
      const response = await fetch(unsplashUrl);

      if (!response.ok) throw new Error(`Unsplash Failed: ${response.status}`);

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Pick a random photo from the returned array to ensure variety
        const randomPhoto =
          data.results[Math.floor(Math.random() * data.results.length)];
        await fetch(
          `${randomPhoto.links.download_location}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
        );

        return {
          url: randomPhoto.urls.regular,
          photographerName: randomPhoto.user.name,
          photographerUrl: randomPhoto.user.links.html,
          isUnsplash: true,
        };
      }
      return null; // null if Unsplash finds exactly 0 images
    } catch (error) {
      console.warn(
        `Unsplash fetch failed for "${searchQuery}":`,
        error.message,
      );
      return null; // null so the main loop knows it failed
    }
  };

  // THE AI GENERATOR 
  const pollinationKey = process.env.POLLINATION_API_KEY;

  const generateAndUploadAIImage = async (promptText) => {
    if (!pollinationKey) return null; // Immediately fail if no key

    const seed = Math.floor(Math.random() * 100000);
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(promptText)}?width=800&height=450&nologo=true&model=flux&seed=${seed}&key=${pollinationKey}`;

    try {
      const response = await fetch(pollinationsUrl, {
        headers: { "User-Agent": "InstaWeb-Labs-Proxy/1.0", Accept: "image/*" },
      });

      if (!response.ok) {
        console.error(
          `Pollinations rejected request. Status: ${response.status}`,
        );
        return null; // Return null so the fallback system kicks in!
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const cloudinaryUrl = await uploadBufferToCloudinary(buffer);
      console.log(`AI image uploaded to Cloudinary: ${cloudinaryUrl}`);

      return cloudinaryUrl;
    } catch (error) {
      console.error("AI Generation Error:", error.message);
      return null;
    }
  };

  function getBusinessPrompt(category, geography) {
    const retail = ["salon", "boutique", "spa", "restaurant", "cafe", "store"];
    const healthcare = ["clinic", "hospital", "dental clinic"];
    const fitness = ["gym", "fitness center", "yoga studio"];
    const services = ["plumber", "electrician", "carpenter", "cleaner"];

    if (retail.includes(category))
      return `modern ${category} storefront in ${geography}, urban street, photorealistic`;
    if (healthcare.includes(category))
      return `modern ${category} building in ${geography}, medical facility exterior, realistic photography`;
    if (fitness.includes(category))
      return `modern ${category} interior in ${geography}, workout equipment, professional studio`;
    if (services.includes(category))
      return `professional ${category} working at client location in ${geography}, realistic photography`;
    return `Modern ${category} website in ${geography} showcasing local business online presence`;
  }

  const imageConfigs = [
    {
      type: "flux",
      prompt: getBusinessPrompt(category, geography),
      unsplashFallback: `modern ${category} exterior`,
    },
    {
      type: "flux",
      prompt: `modern SaaS website builder dashboard showing analytics for ${category} business, clean UI interface, charts and graphs`,
      unsplashFallback: `business analytics dashboard laptop`,
    },
    { type: "unsplash", prompt: `${category} service professional` },
    {
      type: "flux",
      prompt: `SEO analytics dashboard showing growth for ${category} business, charts increasing, digital marketing concept`,
      unsplashFallback: `business growth charts and graphs`,
    },
    {
      type: "unsplash",
      prompt: `${category} business owner working on laptop`,
    },
  ];

  // THE MASTER EXECUTION LOOP
  const imagePromises = imageConfigs.map(async (config, index) => {
    try {
      if (config.type === "flux") {
        console.log(`Generating AI Image ${index + 1}/5...`);
        const aiUrl = await generateAndUploadAIImage(config.prompt);
        if (aiUrl) return aiUrl; // Success!

        console.log(
          `AI limit reached. Falling back to dynamic Unsplash for Image ${index + 1}...`,
        );
        const unsplashFallback = await fetchUnsplashImage(
          config.unsplashFallback || config.prompt,
        );
        if (unsplashFallback) return unsplashFallback;

        // Call the Smart Shield 
        return await getEmergencyImage(index);
      }

      if (config.type === "unsplash") {
        console.log(`Fetching Real Image ${index + 1}/5 (Unsplash)...`);
        const unsplashImg = await fetchUnsplashImage(config.prompt);
        if (unsplashImg) return unsplashImg; // Success!

        console.log(
          `Unsplash found no images. Falling back to AI for Image ${index + 1}...`,
        );
        const aiFallbackUrl = await generateAndUploadAIImage(
          `Highly realistic cinematic photography of ${config.prompt}, 8k resolution`,
        );
        if (aiFallbackUrl) return aiFallbackUrl;

        // Call the Smart Shield 
        return await getEmergencyImage(index);
      }
    } catch (criticalError) {
      console.error(
        `CRITICAL FAILURE for Image ${index + 1}:`,
        criticalError.message,
      );
      // Call the Smart Shield 
      return await getEmergencyImage(index);
    }
  });

  const imageUrls = await Promise.all(imagePromises);
  return imageUrls;
}

function assembleFinalHtml(html, images, category, geography) {
  let finalHtml = html;
  
  // INJECTING THE IMAGES AND ALT TAGS
  const seoAltTags = [
    `Modern ${category} website in ${geography} showcasing local business online presence`,
    `Websites.co.in website builder dashboard for ${category} business management`,
    `${category} owner in ${geography} having a great customer experience on their website, leading to increased bookings and revenue`,
    `Local ${category} service business website analytics showing growth in traffic and customer engagement from SEO optimization`,
    `Advanced local SEO optimization and Google Analytics integration for ${category}s`
  ];

  images.forEach((imgData, index) => {
    const imgUrl = typeof imgData === "object" ? imgData.url : imgData;
    const isUnsplash = typeof imgData === "object" && imgData.isUnsplash;

    const attributionHtml = isUnsplash
      ? `<figcaption class="text-center text-sm font-medium text-slate-500 mt-4">
          ${seoAltTags[index]} 
          <span class="block text-xs mt-1.5 opacity-80">
            Photo by <a href="${imgData.photographerUrl}?utm_source=InstaWeb_Labs&utm_medium=referral" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: medium; text-decoration: underline;">${imgData.photographerName}</a> on <a href="https://unsplash.com/?utm_source=InstaWeb_Labs&utm_medium=referral" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: medium; text-decoration: underline;">Unsplash</a>
          </span>
        </figcaption>`
      : `<figcaption class="text-center text-sm font-medium text-slate-500 mt-4">${seoAltTags[index]}</figcaption>`;
    const imgElement = `
      <figure class="my-12">
        <img src="${imgUrl}" alt="${seoAltTags[index]}" class="w-full h-auto rounded-2xl shadow-xl object-cover border border-slate-200" loading="lazy" />
        ${attributionHtml}
      </figure>
    `;
    finalHtml = finalHtml.replace(`***IMAGE_${index + 1}***`, imgElement);
  });

// THE EXACT HYPERLINKS (Guarantees the URL is present for the SEO audit)
  const ctaElement = `
    <div class="text-center px-2 py-1 my-12 bg-blue-50 p-8 rounded-2xl border border-blue-100">
      <h3 class="text-2xl font-bold text-slate-900 mb-4">Ready to grow your ${category} in ${geography}?</h3>
      <p class="text-slate-600 mb-6">Avoid expensive website builders. Get a free domain, hosting, and SEO tools included in one platform.</p>
      <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" class="bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:bg-blue-700 transition block sm:inline-block">
        Create your website instantly with Websites.co.in
      </a>
    </div>
  `;

  // Replacing all instances of the CTA token with our perfect HTML block

  // finalHtml = finalHtml.split('***CTA_LINK***').join(ctaElement);
  finalHtml = finalHtml.replace(/\*\*\*CTA[_ ]LINK\*\*\*/gi, ctaElement);


  return finalHtml;
}