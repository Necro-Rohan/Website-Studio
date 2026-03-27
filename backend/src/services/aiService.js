import { GoogleGenAI, Type } from "@google/genai";
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

const MASTER_FAQ_LIST = `
1. Why does a business need a website?
2. Why does physical address of a business need to be entered at the time of website creation?
3. There's a lot of hype for SEO. What is SEO?
4. How does my location help in online exposure?
5. What is websites.co.in?
6. What does the websites.co.in platform do?
7. Along with creating the website, does websites.co.in handle SEO for the website too?
8. Isn't updating a website with pages or content require technical skills?
9. How can I create or update a page on my website through the web dashboard?
10. How can I create or update a post on my website through the web dashboard?
11. Does websites.co.in have an app?
12. How do I make updates to pages through the app?
13. How do I create posts through the app?
14. What is the ‘SEO tags’ section while creating or updating posts and pages?
15. If I've added content to a page but don't want to publish it yet, will it be saved as a draft?
16. Is the dashboard available to use for free?
17. Where can I change my business information?
18. What is the process for subscribing to a plan?
19. I am limited to a certain number of features, how can I activate them?
20. I want to buy a domain through Websites.co.in, how can I do that?
21. I want to link my existing domain to the website, what are the steps to add it?
22. Why should I update my website regularly?
23. Can I share my posts on social media?
24. I am unable to share my post on social media. Is the web page broken?
25. What content should I add to my website?
26. Is there a way for potential customers to contact the business directly?
27. Are there templates available for E-commerce?
28. Where can I monitor the analytics of my website?
29. How will SEO help in the growth of my business?
30. How long would it take for SEO to improve my business and to begin attaining traffic through organic web searches?
31. Does Websites.co.in provide inorganic growth?
32. How do I know whether websites.co.in is the platform for my business?
33. What is organic web traffic?
34. Where can I view the orders made for products on my website?
35. Where can I view the updates made to my websites?
36. How can I add new pages? Can I add pages through the app?
`;


/**
 * Micro-Retry Helper to prevent API Rate Limits (429) and timeouts 
 * from crashing the entire BullMQ job.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        // If it's an Unsplash API call, return JSON. Otherwise, return the buffer (for Pollinations).
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }
        return await response.arrayBuffer();
      }

      // If Rate Limited (429), trigger exponential backoff
      if (response.status === 429) {
        const waitTime = (i + 1) * 5000; // 5s, 10s, 15s
        console.warn(`[API Rate Limited] Retrying ${url} in ${waitTime}ms...`);
        await new Promise(res => setTimeout(res, waitTime));
        continue;
      }

      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error; // Fail completely if out of retries
      console.warn(`[Fetch Error] ${error.message}. Retrying in 3s...`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}


function getTopHalfSchema(category, geography) {
  return {
    type: Type.OBJECT,
    properties: {
      metaTitle: {
        type: Type.STRING,
        description: `SEO title under 60 chars containing ${category} and ${geography}`,
      },
      metaDescription: {
        type: Type.STRING,
        description: "SEO description under 160 chars",
      },
      hero: {
        type: Type.OBJECT,
        properties: {
          h1: { type: Type.STRING },
          paragraphs: {
            type: Type.STRING,
            description: "A highly persuasive 20-25 words paragraph.",
          },
        },
      },
      introduction: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'The Evolving Digital Landscape for ${category}s in ${geography}'`,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Generate exactly 3 massive paragraphs (80-85 words each) exploring the local market context for ${category}s in ${geography}.`,
          },
        },
      },
      industryTrends: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Future Trends in the ${geography} ${category} Industry'`,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Generate exactly 2 massive paragraphs (80-85 words each) detailing why digital transformation is mandatory.",
          },
        },
      },
      theCostOfInaction: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'The Cost of Not Having a Website & Common Mistakes'`,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Generate exactly 2 massive paragraphs (80-85 words each) quantifying lost revenue and common digital mistakes.",
          },
        },
      },
      features: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Essential Digital Tools for ${category}s'`,
          },
          list: {
            type: Type.ARRAY,
            description: `Generate exactly 5 highly specific features for a ${category} website.`,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: {
                  type: Type.STRING,
                  description: "A detailed 60-word explanation of the feature.",
                },
                iconKeyword: { type: Type.STRING },
              },
            },
          },
        },
      },
      caseStudies: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Local Success Stories: ${category}s in ${geography}'`,
          },
          studies: {
            type: Type.ARRAY,
            description: `Generate 2 hypothetical but highly realistic case studies of ${category} businesses in ${geography}.`,
            items: {
              type: Type.OBJECT,
              properties: {
                businessProfile: { type: Type.STRING },
                theProblem: {
                  type: Type.STRING,
                  description: "60-word description of their struggles.",
                },
                theSolution: {
                  type: Type.STRING,
                  description: "60-word description of the fix.",
                },
                theResult: {
                  type: Type.STRING,
                  description: "60-word description of their revenue growth.",
                },
              },
            },
          },
        },
      },
    },
    required: ["metaTitle", "metaDescription", "hero", "introduction", "industryTrends", "theCostOfInaction", "features", "caseStudies"],
  }
}


function getBottomHalfSchema(category, geography) {
  return {
    type: Type.OBJECT,
    properties: {
      competitorComparison: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'How We Compare to Other Platforms for ${category}s'`,
          },
          comparisons: {
            type: Type.ARRAY,
            description: `Compare against Wix, WordPress, and Shopify for a ${category}.`,
            items: {
              type: Type.OBJECT,
              properties: {
                platformName: { type: Type.STRING },
                biggestDrawback: {
                  type: Type.STRING,
                  description: `A detailed pointwise drawback (minimum 3 points) explanation of why it fails for a ${category} in ${geography}.`,
                },
                ourAdvantage: {
                  type: Type.STRING,
                  description:
                    "A detailed pointwise advantage (minimum 3 points) explanation of why Websites.co.in is superior.",
                },
              },
            },
          },
        },
      },
      whyChooseUs: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: "e.g., 'Why Websites.co.in is the Ultimate Solution'",
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Generate exactly 2 massive paragraphs (80-100 words each). Paragraph 1 MUST highlight the extreme value (Free Domain, Free Hosting, Free SSL) and how the '1-Click Facebook Page to Website' tool saves thousands in development costs. Paragraph 2 MUST pitch the 'Magic SEO Tool' that automagically ranks sites without expensive agencies, and mention the plug-n-play e-commerce readiness.`,
          },
          platformBenefits: {
            type: Type.ARRAY,
            description:
              "Generate exactly 8 short, punchy bullet points highlighting the best technical integrations from this list: Unlimited Products, WhatsApp & Live Chat, Auto-SEO, Facebook Pixel, Hotjar, Google Analytics, Auto Multilingual, and Premium 1-on-1 Support.",
            items: {
              type: Type.OBJECT,
              properties: {
                benefitName: {
                  type: Type.STRING,
                  description: "e.g., 'Magic Auto-SEO'",
                },
                benefitDetail: {
                  type: Type.STRING,
                  description:
                    "e.g., 'Rank on Google automagically without doing keyword research or hiring an agency.'",
                },
              },
            },
          },
        },
      },
      howItWorks: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Launch Your ${category} Site in 3 Easy Steps'`,
          },
          steps: {
            type: Type.ARRAY,
            description: `A 3-step guide to launching the ${category} site.`,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: {
                  type: Type.STRING,
                  description: "A detailed 70-word explanation.",
                },
              },
            },
          },
        },
      },
      localSeoGuide: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Local SEO Strategies for ${category}s in ${geography}'`,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Generate exactly 2 massive paragraphs (70-75 words each) on geo-tagging and automated listings in ${geography}.`,
          },
        },
      },
      faqs: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Frequently Asked Questions by ${geography} ${category}s'`,
          },
          questions: {
            type: Type.ARRAY,
            description: `Select exactly 12 questions from the provided MASTER FAQ LIST. Answer them specifically for ${category} owners in ${geography}.`,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description:
                    "Must be an exact question selected from the MASTER FAQ LIST.",
                },
                answer: {
                  type: Type.STRING,
                  description: `A massive, highly informative 60-65 words answer. You MUST explain how Websites.co.in specifically solves this using its platform features (like the mobile app, dashboard, or auto-SEO) applied to a ${category} in ${geography}.`,
                },
              },
            },
          },
        },
      },
    },
    required: [
      "competitorComparison",
      "whyChooseUs",
      "howItWorks",
      "localSeoGuide",
      "faqs",
    ],
  };
}


export async function generateSEOContentPipeline(adjective, category, geography) {
  let formattedAdjective = adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase();
  let formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  let formattedGeography = geography.charAt(0).toUpperCase() + geography.slice(1).toLowerCase();
  const seoAdjective = formattedAdjective;
  const keyword = `${seoAdjective} Website Builder for ${formattedCategory} in ${formattedGeography}`;

  const generatedSlug = `${adjective}-website-builder-for-${category}-in-${geography}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    console.log("1. Generating Structured JSON Content with Gemini...");
    const jsonData = await generateJSONContent(keyword, category, geography);
    if (!jsonData || !jsonData.introduction || !jsonData.features) {
      throw new Error(
        "AI Content Generation failed or returned invalid JSON. Stopping pipeline.",
      );
    }

    console.log("2. Generating AI and Stock Images...");
    const images = await generateImages(category, geography);


    return {
      slug: generatedSlug,
      metaTitle: jsonData.metaTitle,
      metaDescription: jsonData.metaDescription,
      h1: jsonData.hero.h1 || jsonData.metaTitle,
      content: jsonData, // Pure JSON for Phase 3 UI
      images: images,
      // htmlContent: fallbackHtml, // THE BRIDGE: Keeps your live site from breaking today!
    };
  } catch (error) {
    console.error("Pipeline Error:", error);
    throw new Error("Failed to execute JSON pipeline");
  }
}

async function callGemini(prompt, schema) {
  let maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        // model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });

      let rawText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(rawText);
    } catch (error) {
      if (error.status === 503 || (error.message && error.message.includes("503"))) {
        const waitTime = (i + 1) * 5000;
        console.warn(`[Gemini API 503] Retrying in ${waitTime}ms...`);
        console.log(error.message);
        await new Promise(res => setTimeout(res, waitTime));
        continue;
      }
      if (error instanceof SyntaxError) {
        console.error("CRITICAL: The AI generated too much text and cut off the JSON string.");
      }
      if (i === maxRetries - 1) throw error;
    }
  }
}

async function generateJSONContent(keyword, category, geography) {
  const basePrompt = `You are a Master SEO Content Writer and Enterprise Architect.
  Generate a massive, comprehensive hybrid landing page for the keyword: "${keyword}".
  Target Audience: ${category} businesses operating in ${geography}.
  
  **CRITICAL RULES (FAILURE MEANS REJECTION):**
  
  1. **BRAND MENTIONS & LINKS:** Maintain a conversational, energetic tone. naturally position Websites.co.in as the smartest choice for local businesses don't explicitly promote it. You may mention "Websites.co.in" A MAXIMUM OF 3 TIMES across the entire JSON output (ideally in the 'whyChooseUs' or 'competitorComparison' sections). DO NOT aggressively bash competitors. 
  
  2. **EXTREME ANTI-LAZINESS RULE:** You must write deeply detailed content. Every paragraph in the narrative sections (introduction, industryTrends, theCostOfInaction, whyChooseUs, localSeoGuide) MUST be 100-120 words long. Do not summarize or rush. Give specific, real-world examples relevant to ${category}s in ${geography}.
  
  3. **SNAPPY, HUMAN TONE & "ANTI-AI" VOICE:** Write like a modern tech blogger (think HubSpot or Intercom). Be punchy, conversational, energetic, consultative, and authoritative. 
    • Speak directly to the reader using "you" and "your". 
    • Use active voice, strong verbs, and varied sentence lengths.
    • **NO ROBOTIC TRANSITIONS:** Do not start sections by summarizing the previous section. Start every new section with a bold statement, a practical question, or a startling fact.
    • **BANNED AI PHRASES (CRITICAL):** You are strictly forbidden from using cliché AI filler words. Do NOT use: "Furthermore," "In today's digital landscape," "Delve into," "Navigating," "In conclusion," "It's no secret that," "Testament to," or "At the end of the day."
  
  4. **WRITING STYLE & VOICE (THE "ANTI-AI" PROTOCOL):**
    • Speak directly to the reader using "you" and "your". 
    • Use active voice, strong verbs, and varied sentence lengths.
    • **NO ROBOTIC TRANSITIONS:** Do not start sections by summarizing the previous section.
    • **BANNED AI PHRASES (CRITICAL):** You are strictly forbidden from using cliché AI filler words. Do NOT use: "Furthermore," "In today's digital landscape," "Delve into," "Navigating," "In conclusion," "It's no secret that," "Testament to," or "At the end of the day."
  
  5. **FORMATTING:** Return ONLY **pure JSON matching the exact schema provided**. If you want to emphasize text inside a paragraph string, you may use basic HTML like <strong> or <i>, but **Strictly DO NOT use markdown (* or #) and DO NOT return raw HTML blocks outside of the JSON structure.**`; 

  const topHalfPrompt = `${basePrompt}\nFocus on the Introduction, Trends, Cost of Inaction, Features , and Case Studies.`;
  const topSchema = getTopHalfSchema(category, geography);

  const bottomHalfPrompt = `${basePrompt}\nFocus on the Competitor Comparison, Why Choose Us, How It Works, Local SEO Guide, and FAQs. **THE FAQ PROTOCOL:** For the FAQ section, you are strictly forbidden from making up your own questions. You MUST select exactly 12 questions from this exact list:
  ${MASTER_FAQ_LIST}
  When answering these 12 questions, seamlessly weave the answers into the context of a ${category} business in ${geography}.`;
  const bottomSchema = getBottomHalfSchema(category, geography);

  // console.log("1a. Fetching Top Half JSON...");
  // console.log("1b. Fetching Bottom Half JSON...");

  console.log("1a. Fetching Top Half JSON...");
  const topData = await callGemini(topHalfPrompt, topSchema);

  //  Waiting 4 seconds before asking Google for the bottom half
  console.log("Waiting 4 seconds to prevent Gemini rate limits...");
  await new Promise((resolve) => setTimeout(resolve, 4000));

  console.log("1b. Fetching Bottom Half JSON...");
  const bottomData = await callGemini(bottomHalfPrompt, bottomSchema);

  if (!topData || !bottomData) {
    throw new Error("One of the AI payload splits failed to generate.");
  }

  console.log("1c. Merging Split Payloads...");
  return {
    ...topData,
    ...bottomData,
  };
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

      const data = await fetchWithRetry(unsplashUrl);

      // if (!response.ok) throw new Error(`Unsplash Failed: ${response.status}`);

      // const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Pick a random photo from the returned array to ensure variety
        const randomPhoto =
          data.results[Math.floor(Math.random() * data.results.length)];
        await fetchWithRetry(
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
      const arrayBuffer = await fetchWithRetry(pollinationsUrl, {
        headers: { "User-Agent": "Website-Studio-Proxy/1.0", Accept: "image/*" },
      });

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

// function assembleFinalHtml(html, images, category, geography) {
//   let finalHtml = html;
  
//   // INJECTING THE IMAGES AND ALT TAGS
//   const seoAltTags = [
//     `Modern ${category} website in ${geography} showcasing local business online presence`,
//     `Websites.co.in website builder dashboard for ${category} business management`,
//     `${category} owner in ${geography} having a great customer experience on their website, leading to increased bookings and revenue`,
//     `Local ${category} service business website analytics showing growth in traffic and customer engagement from SEO optimization`,
//     `Advanced local SEO optimization and Google Analytics integration for ${category}s`
//   ];

//   images.forEach((imgData, index) => {
//     const imgUrl = typeof imgData === "object" ? imgData.url : imgData;
//     const isUnsplash = typeof imgData === "object" && imgData.isUnsplash;

//     const attributionHtml = isUnsplash
//       ? `<figcaption class="text-center text-sm font-medium text-slate-500 mt-4">
//           ${seoAltTags[index]} 
//           <span class="block text-xs mt-1.5 opacity-80">
//             Photo by <a href="${imgData.photographerUrl}?utm_source=Website_Studio&utm_medium=referral" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: medium; text-decoration: underline;">${imgData.photographerName}</a> on <a href="https://unsplash.com/?utm_source=Website_Studio&utm_medium=referral" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: medium; text-decoration: underline;">Unsplash</a>
//           </span>
//         </figcaption>`
//       : `<figcaption class="text-center text-sm font-medium text-slate-500 mt-4">${seoAltTags[index]}</figcaption>`;
//     const imgElement = `
//       <figure class="my-12">
//         <img src="${imgUrl}" alt="${seoAltTags[index]}" class="w-full h-auto rounded-2xl shadow-xl object-cover border border-slate-200" loading="lazy" />
//         ${attributionHtml}
//       </figure>
//     `;
//     finalHtml = finalHtml.replace(`***IMAGE_${index + 1}***`, imgElement);
//   });

// // THE EXACT HYPERLINKS (Guarantees the URL is present for the SEO audit)
//   const ctaElement = `
//     <div class="text-center px-2 py-1 my-12 bg-blue-50 p-8 rounded-2xl border border-blue-100">
//       <h3 class="text-2xl font-bold text-slate-900 mb-4">Ready to grow your ${category} in ${geography}?</h3>
//       <p class="text-slate-600 mb-6">Avoid expensive website builders. Get a free domain, hosting, and SEO tools included in one platform.</p>
//       <a href="https://websites.co.in" target="_blank" rel="noopener noreferrer" class="bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:bg-blue-700 transition block sm:inline-block">
//         Create your website instantly with Websites.co.in
//       </a>
//     </div>
//   `;

//   // Replacing all instances of the CTA token with our perfect HTML block

//   // finalHtml = finalHtml.split('***CTA_LINK***').join(ctaElement);
//   finalHtml = finalHtml.replace(/\*\*\*CTA[_ ]LINK\*\*\*/gi, ctaElement);


//   return finalHtml;
// }