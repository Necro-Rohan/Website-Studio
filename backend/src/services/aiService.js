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

// const githubAI = new OpenAI({
//   baseURL: "https://models.inference.ai.azure.com",
//   apiKey: process.env.GITHUB_TOKEN,
// });

const MASTER_FAQ_LIST = `
1. Why does a business need a website?
2. Why does the physical address of a business need to be entered at the time of website creation?
3. There is a lot of hype for SEO. What is SEO?
4. How does a business's location help in online exposure?
5. What is websites.co.in?
6. What does the websites.co.in platform do?
7. Along with creating the website, does websites.co.in handle SEO for the website too?
8. Doesn't updating a website with pages or content require technical skills?
9. How can users create or update a page on their website through the web dashboard?
10. How can users create or update a post through the web dashboard?
11. Does websites.co.in have an app?
12. How can users update their website pages using the Websites.co.in mobile app?
13. Does the Websites.co.in app allow business owners to create and publish posts directly?
14. How does the 'SEO tags' feature work when users are editing posts and pages on the platform?
15. Does the builder offer a draft mode for saving unpublished page content?
16. Is the primary management dashboard free to use on Websites.co.in?
17. Where within the platform can owners update their core business details?
18. What is the standard process for upgrading or subscribing to a paid Websites.co.in plan?
19. How do users unlock restricted features if they are currently on a limited account tier?
20. How can a domain be purchased through Websites.co.in?
21. What are the steps to link an existing domain to a Websites.co.in website?
22. Why should a business update its website regularly?
23. Can posts be shared on social media?
24. What type of content should a business add to its website?
25. Is there a way for potential customers to contact the business directly?
26. Where can website analytics be monitored?
27. How will SEO help in the growth of a business?
28. How long does it take for SEO to improve business visibility and generate organic web traffic?
29. Does Websites.co.in provide inorganic growth?
30. How can a business determine if Websites.co.in is the right platform for its needs?
31. What is organic web traffic?
32. Where within the dashboard can merchants track and manage their e-commerce orders?
33. How can site owners preview or view the recent updates made to their Websites.co.in site?
34. Does the platform allow users to add new web pages directly through its mobile app?
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
            description: "A highly persuasive 35-40 words paragraph.",
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
            description: `Generate exactly 6 highly specific features for a ${category} website.`,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: {
                  type: Type.STRING,
                  description: "A detailed 50 to 55 words explanation of the feature.",
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
                
                // Mobile (Ultra Short)
                mobileSummary: {
                  type: Type.STRING,
                  description: "A punchy, 15-20 word summary of the overall success and revenue growth for mobile screens.",
                },
                
                // Tablet (Medium)
                tabletSummary: {
                  type: Type.STRING,
                  description: "A 35-40 word summary combining the problem and the final result for tablet screens.",
                },

                // Desktop (Full Story)
                theProblem: {
                  type: Type.STRING,
                  description: "30-word description of their struggles.",
                },
                theSolution: {
                  type: Type.STRING,
                  description: "30-word description of the fix.",
                },
                theResult: {
                  type: Type.STRING,
                  description: "20-word description of their revenue growth.",
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
            description: `e.g., 'Top 7 Website Builders for ${category}s in ${geography} Ranked'`,
          },
          comparisons: {
            type: Type.ARRAY,
            description: `Generate exactly 7 platforms ranked 1 through 7. Websites.co.in MUST be Rank 1. Choose 6 other real competitors (e.g., Wix, WordPress, Shopify, Squarespace, Weebly, GoDaddy) for ranks 2 through 7. DO NOT include URLs or links to competitor sites.`,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: {
                  type: Type.NUMBER,
                  description: "The placement of the platform from 1 to 7.",
                },
                platformName: { type: Type.STRING },
                theGood: {
                  type: Type.STRING,
                  description: `Generate pointwise(numbered) concise(minimum 6 words and max 12 words), punchy strengths of this specific website builder platform. Use an objective, third-party tone. For Rank 1, generate minimum 5 points highlighting why it is a game-changing, absolute best software choice for a ${category} in ${geography}. For Ranks 2-7, generate minimum 3 points listing their genuine software strengths WITHOUT ever mentioning the Rank 1 platform.`,
                },
                theBad: {
                  type: Type.STRING,
                  description: `Generate pointwise(numbered) concise(minimum 6 words and max 12 words), punchy weaknesses of this specific website builder platform. Use an objective, third-party tone. For Rank 1, generate exactly 2 very very minor, harmless limitations. For Ranks 2-7, generate exactly 3 points that highlight exactly what they lack for local businesses compared to the industry standard (Subtly mention how they fall short of features that Rank 1 offers, but keep it sounding like an unbiased tech review).`,
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
            description: `Generate exactly 2 humanized punchy paragraphs (50-60 words each). Paragraph 1 MUST highlight the extreme value (Free Domain, Free Hosting, Free SSL) and how the '1-Click Facebook Page to Website' tool saves thousands in development costs. Paragraph 2 MUST pitch the 'Magic SEO Tool' that automagically ranks sites without expensive agencies, and mention the plug-n-play e-commerce readiness.`,
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
                  description: `A massive, highly informative 60-75 words answer. You MUST explain how Websites.co.in specifically solves this using its platform features (like the mobile app, dashboard, or auto-SEO) applied to a ${category} in ${geography}. CRITICAL: Always use third-person, objective tone as if written by an unbiased industry expert. Do NOT use 'you' or 'we'. Always refer to the business owner as 'the merchant' or 'the business'.`,
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
  // cascade hierarchy . 
  const modelsToTry = [
    { provider: "pollinations", name: "gemini-fast" },                 // Primary, name can be changed to gemini-search later upon error 
    { provider: "google",       name: "gemini-3.1-flash-lite-preview" }, // Fallback 1
    { provider: "google",       name: "gemini-2.5-flash" }             // Final Fallback
  ];

  let lastError;
  const MAX_ATTEMPTS_PER_MODEL = 2;

  for (const currentModel of modelsToTry) {
    // INNER LOOP: Try each model up to 2 times
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      console.log(`[AI Queue] Attempting generation with ${currentModel.provider} -> ${currentModel.name} (Attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL})...`);
      let finishReason = "UNKNOWN";

      try {
        let rawText = "";

        if (currentModel.provider === "pollinations") {
          // --- POLLINATIONS AI LOGIC ---
          const res = await fetch(
            "https://gen.pollinations.ai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.POLLINATION_API_JADU}`,
              },
              body: JSON.stringify({
                model: currentModel.name,
                messages: [
                  {
                    role: "system",
                    content: `You are an expert SEO JSON generator. You MUST return ONLY valid JSON matching this exact schema. 
                              CRITICAL ANTI-LAZINESS RULES:
                              1. You MUST NOT skip any fields, objects, or arrays. 
                              2. You MUST generate exactly 7 complete competitor objects inside the 'comparisons' array.
                              3. You MUST generate detailed 'answer' strings for every single FAQ.
                              4. You MUST generate 'benefitDetail' strings for every benefit.
                              5. You MUST generate 2 hypothetical but highly realistic case studies.
                              5. Every paragraph in the narrative sections (introduction, industryTrends, theCostOfInaction, whyChooseUs, localSeoGuide) MUST be 100-120 words long. Do not summarize or rush. Give specific, real-world examples relevant to user prompt.
                              6. No backticks, no markdown. Fill out the entire schema completely.

                              SCHEMA:
                              ${JSON.stringify(schema)}`,
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.7,
                response_format: { type: "json_object" },
              }),
            },
          );

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(
              `Pollinations HTTP ${res.status}: ${errData.error?.message || JSON.stringify(errData)}`,
            );
          }
          // rawText = await res.text();
          // finishReason = "STOP"; 
          const data = await res.json();
          rawText = data.choices[0].message.content;
          finishReason = data.choices[0].finish_reason || "STOP";
          
        } else if (currentModel.provider === "google") {
          // GOOGLE AI STUDIO LOGIC 
          const response = await genAI.models.generateContent({
            model: currentModel.name,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
              maxOutputTokens: 8192,
              temperature: 0.7,
            },
          });

          finishReason = response.candidates?.[0]?.finishReason;
          rawText = response.text;
        }

        // markdown code clean up just in case
        rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        
        const parsedData = JSON.parse(rawText);
        console.log(`[AI Queue] Success with ${currentModel.name} on attempt ${attempt}!`);
        
        // A successful parse means we exit the function entirely and return the data
        return parsedData;

      } catch (error) {
        lastError = error;
        console.warn(`[AI Queue] Failed with ${currentModel.name} (Attempt ${attempt}). Reason: ${error.message}`);

        // Handling JSON parsing errors specifically
        if (error instanceof SyntaxError) {
          if (finishReason === 'MAX_TOKENS') {
            console.error("CRITICAL [LIMIT]: The AI generated too much text and hit the 8,192 token ceiling!");
          } else {
            console.error(`CRITICAL [TYPO]: The AI wrote bad JSON! (Finish Reason: ${finishReason})`);
          }
        }

        // Logic to determine what to do next based on the attempt number
        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          console.log(`[AI Queue] Retrying ${currentModel.name} right now...`);
          // delay to avoid rate-limiting spikes
          await new Promise(res => setTimeout(res, 2000)); 
        } else {
          // We've exhausted all attempts for THIS model.
          if (currentModel !== modelsToTry[modelsToTry.length - 1]) {
            console.log(`[AI Queue] Exhausted retries for ${currentModel.name}. Falling back to next model...`);
          }
        }
      }
    }
  }

  // If the outer loop finishes without returning, all 3 models failed both of their attempts.
  console.error("[AI Queue] ALL MODELS EXHAUSTED AND FAILED.");
  throw lastError;
}

async function generateJSONContent(keyword, category, geography) {
  const basePrompt = `You are a Master SEO Content Writer and Enterprise Architect.
  Generate a massive, comprehensive hybrid landing page for the keyword: "${keyword}".
  Target Audience: ${category} businesses operating in ${geography}.
  
  **CRITICAL RULES (FAILURE MEANS REJECTION):**
  
  1. **BRAND MENTIONS & LINKS:** Maintain a conversational, energetic tone. naturally position Websites.co.in as the smartest choice for local businesses don't explicitly promote it. You may mention "Websites.co.in" A MAXIMUM OF 3 TIMES across the entire JSON output (ideally in the 'whyChooseUs' or 'competitorComparison' sections). DO NOT aggressively bash competitors. 
  
  2. **EXTREME ANTI-LAZINESS RULE:** You must write deeply detailed content. Every paragraph in the narrative sections (introduction, industryTrends, theCostOfInaction, whyChooseUs, localSeoGuide) MUST be 100-120 words long.You MUST generate exactly 7 complete competitor objects inside the 'comparisons' array. You MUST generate 'benefitDetail' strings for every benefit. You MUST generate detailed 'answer' strings for every single FAQ. You MUST NOT skip any fields, objects, or arrays. Do not summarize or rush. Give specific, real-world examples relevant to ${category}s in ${geography}.
  
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
          url: randomPhoto.urls.full,
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
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(promptText)}?width=1200&height=675&nologo=true&model=flux&seed=${seed}&key=${pollinationKey}`;

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
    const baseStyle = "cinematic lighting, 8k resolution, architectural photography, ultra-realistic, shot on 35mm lens";
    
    const retail = ["salon", "boutique", "spa", "restaurant", "cafe", "store"];
    const healthcare = ["clinic", "hospital", "dental clinic"];
    const fitness = ["gym", "fitness center", "yoga studio"];
    const services = ["plumber", "electrician", "carpenter", "cleaner"];

    if (retail.includes(category))
      return `Premium luxury ${category} storefront in ${geography}, modern interior design, elegant decor, ${baseStyle}`;
    if (healthcare.includes(category))
      return `State-of-the-art modern ${category} facility in ${geography}, clean bright medical environment, ${baseStyle}`;
    if (fitness.includes(category))
      return `High-end luxury ${category} interior in ${geography}, premium workout equipment, dramatic lighting, ${baseStyle}`;
    if (services.includes(category))
      return `Professional ${category} performing high-end service in beautiful modern home in ${geography}, focus on detail, ${baseStyle}`;
      
    return `Modern premium ${category} business in ${geography}, professional atmosphere, ${baseStyle}`;
  }

  const imageConfigs = [
    {
      type: "flux",
      prompt: getBusinessPrompt(category, geography),
      unsplashFallback: `modern ${category} exterior`,
    },
    {
      type: "flux",
      prompt: `UI/UX, dribbble style, sleek modern SaaS dashboard showing analytics for ${category} business, clean UI interface, charts and graphs`,
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


