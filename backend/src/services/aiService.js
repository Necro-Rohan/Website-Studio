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

const faqPools = {
  general: [
    "What is a website builder and how does it work?",
    "Which website builder is best for beginners?",
    "Do I need coding skills to use a website builder?",
    "How do I choose the right website builder for my business?",
    "What features should I look for in a website builder?",
    "Are website builders better than hiring a developer?",
    "Can I switch website builders later if needed?",
    "What are the limitations of website builders?",
    "Is it worth using a website builder for a small business?",
    "How long does it take to build a website using a builder?",
  ],

  pricing: [
    "How much does a website builder typically cost?",
    "Are there any hidden costs in website builders?",
    "Is a free website builder enough for a business?",
    "What is the difference between free and paid plans?",
    "Do I need to pay separately for hosting and domain?",
    "Which website builders offer the best value for money?",
    "Are cheap website builders reliable?",
    "How much should a small business spend on a website?",
    "Do website builders charge extra for SEO tools?",
    "Is it cheaper to build a website yourself or hire someone?",
  ],

  features: [
    "Do website builders support online booking systems?",
    "Can I add e-commerce features to my website?",
    "Are website builders mobile-friendly?",
    "Do website builders include SEO tools?",
    "Can I customize the design of my website?",
    "Do website builders support third-party integrations?",
    "Can I create multiple pages easily?",
    "Do website builders offer templates for my industry?",
    "Can I add forms and contact options to my website?",
    "Do website builders support blogging features?",
  ],

  seo: [
    "Can a website builder help my business rank on Google?",
    "How do website builders handle SEO optimization?",
    "Is local SEO possible with a website builder?",
    "How long does it take for SEO results to show?",
    "Can I edit meta tags and keywords easily?",
    "Do website builders generate sitemap and robots.txt automatically?",
    "Will my website appear on Google Maps searches?",
    "What SEO mistakes should I avoid with website builders?",
    "Are website builders good for long-term SEO growth?",
    "Can I track website traffic and analytics easily?",
  ],

  usability: [
    "How easy is it to update content on my website?",
    "Can I manage my website from a mobile device?",
    "Do website builders offer drag-and-drop editing?",
    "Can beginners create a professional-looking website?",
    "How often should I update my website content?",
    "Do website builders offer automatic backups?",
    "Is it easy to redesign my website later?",
    "Can multiple users manage the same website?",
    "How secure are website builders?",
    "What kind of support do website builders provide?",
  ],

  growth: [
    "Can a website builder help generate leads for my business?",
    "How do website builders help increase sales?",
    "Can I scale my website as my business grows?",
    "Are website builders suitable for large businesses?",
    "How do website builders improve customer engagement?",
    "Can I integrate social media with my website?",
    "Do website builders support online payments?",
    "Can I use a website builder for multiple locations?",
    "How do website builders compare to WordPress?",
    "What is the best website builder for my specific industry?",
  ],
};

function pickRandom(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}


function generateFAQsDynamic() {
  const total = Math.floor(Math.random() * 5) + 8; // 8–12 FAQs

  let result = [];

  result.push(...pickRandom(faqPools.general, 2));
  result.push(...pickRandom(faqPools.pricing, 2));
  result.push(...pickRandom(faqPools.features, 2));
  result.push(...pickRandom(faqPools.seo, 2));

  // dynamic remaining fill
  const remaining = total - result.length;

  const extraPool = [
    ...faqPools.usability,
    ...faqPools.growth,
  ];

  result.push(...pickRandom(extraPool, remaining));

  return result.sort(() => 0.5 - Math.random());
}

const MASTER_FAQ_LIST = generateFAQsDynamic();
const selectedFAQs = generateFAQsDynamic();

const faqText = selectedFAQs.map((q, i) => `${i + 1}. ${q}`).join("\n");

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

function getTopHalfSchema(adjective, category, geography) {
  return {
    type: Type.OBJECT,
    properties: {
      metaTitle: {
        type: Type.STRING,
        description: `Generate a high-CTR SEO title under 60 characters.
        CRITICAL RULES:
        - DO NOT always start with "Top 10" or "Best"
        - Randomly choose ONE of the following title formats
        - MUST include ${category} and ${geography}, If the ${geography} is a long name, you can use a well-known abbreviation, short name or a geo modifier like "Near You" or "Local" instead to save characters.But you have to make sure whole title is under 60 characters.
        - MUST feel natural and human-written
        - **MOST IMPORTANT**: The title MUST be under 60 characters to avoid Google truncation and maximize click-through rates. If the title exceeds 60 characters, it will be penalized in search rankings and may not perform well in attracting clicks. Always prioritize concise, punchy language that fits within this limit while still being engaging and relevant to the target audience.

        TITLE FORMAT VARIANTS(You don't have to follow these verbatim, but they should be SIMILAR in STYLE and STRUCTURE. The key is to randomize and not repeat the same format across articles, so don't just pick directly from this list every time, use it as inspiration to create similar engaging titles that fit the character limit, also Please don't just favour the first 2 formats, make sure to use all of them to create diverse titles across different articles):

        1. "10 Best ${category} Website Builders in ${geography} (2026)"
        2. "Best Website Builders for [pluralize the ${category}] in ${geography} - Compared"
        3. "${category} Website Builders in ${geography}: Top Picks & Costs"
        4. "In ${geography}, The Best Website Builder for [pluralize the ${category}] is... (2026 Guide)"
        5. "${category} Website Builders in ${geography} (Pricing + Features)"

        IMPORTANT:
        - Use numbers in only 2-3 variants (not all)
        - Avoid repeating the same structure across pages
        - Keep it punchy, clickable, and natural`,
      },
      metaDescription: {
        type: Type.STRING,
        description: `SEO description under 160 chars. Write strictly in an objective, 3rd-person tone (never use 'we', 'our', or 'us'). DO NOT mention specific brand names. Instead, focus entirely on the value of finding the top 10 tools for the specific ${category} in ${geography} to entice clicks.`,
      },
      hero: {
        type: Type.OBJECT,
        properties: {
          h1: {
            type: Type.STRING,
            description: `A compelling headline (H1) that explicitly mentions exactly 10 builders. It MUST naturally incorporate the adjective '${adjective}', the ${category}, and ${geography} to entice clicks. (e.g., 'The 10 Most ${adjective} Website Builders for...' or 'Top 10 ${adjective} Platforms for...') or something similarly engaging that highlights the comprehensive ranking and review aspect of the article. The tone should be objective and third-person, as if written by an impartial industry expert. DO NOT use first-person language like 'we' or 'our'. The focus should be entirely on the value of the content for the reader (finding the top 10 tools for their specific needs) rather than promoting any particular solution.`,
          },
          paragraphs: {
            type: Type.STRING,
            description: `A highly persuasive 35-40 words paragraph. It must explicitly state that you have reviewed and ranked the 10 best website builders for ${category}s in ${geography} to help them easily compare their options and launch their business. DO NOT mention any specific brand names. The tone should be objective and third-person, as if written by an impartial industry expert. The focus should be entirely on the value of the content for the reader (finding the top 10 tools for their specific needs) rather than promoting any particular solution.`,
          },
        },
        required: ["h1", "paragraphs"],
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
            description: `Generate exactly 3 massive paragraphs (50-60 words each) exploring the local market context for ${category}s in ${geography}.`,
          },
        },
        required: ["heading", "paragraphs"],
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
              "Generate exactly 2 massive paragraphs (40-50 words each) detailing why digital transformation is mandatory.",
          },
        },
        required: ["heading", "paragraphs"],
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
              "Generate exactly 2 massive paragraphs (60-65 words each) quantifying lost revenue and common digital mistakes.",
          },
        },
        required: ["heading", "paragraphs"],
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
                  description:
                    "A detailed 30 to 35 words explanation of the feature.",
                },
                iconKeyword: { type: Type.STRING },
              },
              required: ["title", "description", "iconKeyword"],
            },
          },
        },
        required: ["heading", "list"],
      },
      localImplementation: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'How ${category}s in ${geography} Actually Use These Builders'`,
          },
          workflows: {
            type: Type.ARRAY,
            description: `CRITICAL: DO NOT generate hypothetical case studies, fake company names, or fake revenue metrics. Instead, describe 2 highly specific, realistic operational workflows that a ${category} in ${geography} requires from a website builder. Focus on local context and actual software features (e.g., integrating local booking systems, managing multi-location inventory, or setting up emergency contact forms).`,
            items: {
              type: Type.OBJECT,
              properties: {
                workflowType: {
                  type: Type.STRING,
                  description: "e.g., 'The Appointment Booking Engine'",
                },
                theRequirement: {
                  type: Type.STRING,
                  description:
                    "35-40 words explaining WHY this specific feature is critical for this niche in this local market.",
                },
                theExecution: {
                  type: Type.STRING,
                  description:
                    "35-40 words explaining exactly HOW a top-tier website builder solves this problem.",
                },
              },
              required: ["workflowType", "theRequirement", "theExecution"],
            },
          },
        },
        required: ["heading", "workflows"],
      },
      realWorldScenarios: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Real-World Scenarios: How ${category}s in ${geography} Improve with Better Websites, CRITICAL: You don't have to use same words as this example, but the heading must clearly indicate that these are real-world, highly realistic scenarios based on actual business problems and how website features solve them. DO NOT use fake company names, fake revenue numbers, or unrealistic claims. Focus on typical business problems and how website features solve them. For this heading, don't use more than 20 words, and make sure to include the ${category} and ${geography} to keep it hyper-relevant and enticing for clicks.`,
          },
          scenarios: {
            type: Type.ARRAY,
            description: `Generate 2 highly realistic, non-fictional scenarios. DO NOT use fake company names, revenue numbers, or claims. Focus on typical business problems and how website features solve them. For example, 1. A typical salon in Pune struggles with missed appointments due to manual booking. When online scheduling is implemented with automated reminders, businesses often reduce no-shows and improve daily slot utilization. 2. A local restaurant in Jaipur faces challenges with order management during peak hours. By integrating an online ordering system, they can streamline operations, reduce errors, and increase customer satisfaction. 3. A small retail store in Lucknow has trouble showcasing its products to a wider audience. With an e-commerce website, they can reach more customers, boost sales, and compete with larger retailers. you can use examples similar to these. Each scenario should be 100% realistic and based on common issues faced by ${category}s in this niche and ${geography}, and how specific website features solve those problems. Each scenario should have a situation, solution, and outcome section.`,
            items: {
              type: Type.OBJECT,
              properties: {
                situation: {
                  type: Type.STRING,
                  description: `Describe a real-world problem (30-40 words) that a typical business of ${category} in ${geography} faces without a good website.`,
                },
                solution: {
                  type: Type.STRING,
                  description: `Explain how a website feature solves it (30-40 words) for a ${category} in ${geography}. CRITICAL: Focus on specific features and realistic implementations rather than vague claims and always maintain an objective, third-person tone as if written by an unbiased freelance writer or editor. Do NOT use 'you' or 'we'. Always refer to the business owner as 'the merchant' or 'the business'.`,
                },
                outcome: {
                  type: Type.STRING,
                  description: `Describe realistic improvements WITHOUT fake metrics (20-30 words) for a ${category} in ${geography}.CRITICAL: Focus on specific features and realistic implementations rather than vague claims and always maintain an objective, third-person tone as if written by an unbiased freelance writer or editor. Do NOT use 'you' or 'we'. Always refer to the business owner as 'the merchant' or 'the business'.`,
                },
              },
              required: ["situation", "solution", "outcome"],
            },
          },
        },
        required: ["heading", "scenarios"],
      },
    },
    required: [
      "metaTitle",
      "metaDescription",
      "hero",
      "introduction",
      "industryTrends",
      "theCostOfInaction",
      "features",
      "localImplementation",
      "realWorldScenarios",
    ],
  };
}


function getBottomHalfSchema(adjective, category, geography, faqText) {
  return {
    type: Type.OBJECT,
    properties: {
      competitorComparison: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'Top 10 ${adjective} Website Builders for ${category}s in ${geography} Ranked'`,
          },
          comparisons: {
            type: Type.ARRAY,
            description: `Generate exactly 10 platforms ranked 1 through 10. Websites.co.in MUST be Rank 1. For ranks 2 through 10, randomly select 9 competitors from this massive pool: [Wix, WordPress, Shopify, Squarespace, Weebly, GoDaddy, Webflow, Duda, Jimdo, Zyro, Site123, Strikingly, Hostinger, BigCommerce, Carrd, Framer, Dorik, Webnode, Ghost, Elementor, Pixpa, HubSpot CMS, WooCommerce, Magento, PrestaShop, Volusion, Shift4Shop, Bubble, Glide, Softr]. **CRITICAL:** You must shuffle and randomize which 9 you pick and their order so no two articles look the same, it should be unique each time you have to randomize each time then select 9 randomly from the randomized list. DO NOT include URLs.`,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: {
                  type: Type.NUMBER,
                  description: "The placement of the platform from 1 to 10.",
                },
                platformName: { type: Type.STRING },
                theGood: {
                  type: Type.STRING,
                  description: `Generate pointwise(numbered) detailed, highly descriptive (it should seem like a human written review) strengths of this specific platform. Use an objective, third-party tone. For Rank 1, generate minimum 5 points (30-45 words per point) highlighting why it is the absolute best software choice for a ${category} in ${geography}. For Ranks 2-10, generate minimum 3 detailed points (30-45 words per point) listing their genuine strengths.`,
                },
                theBad: {
                  type: Type.STRING,
                  description: `Generate pointwise(numbered) detailed, highly descriptive weaknesses. Use an objective, third-party tone. For Rank 1, generate exactly 2 very minor, harmless limitations (20-30 words per point). For Ranks 2-10, generate exactly 3 detailed points (30-45 words per point) highlighting what they lack for local businesses compared to the industry standard.`,
                },
              },
              required: ["rank", "platformName", "theGood", "theBad"],
            },
          },
        },
        required: ["heading", "comparisons"],
      },
      whyChooseUs: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description:
              "e.g., 'Why we think Websites.co.in is the Ultimate Solution'",
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Generate exactly 2 humanized punchy paragraphs (40-45 words each). Paragraph 1 MUST highlight the extreme value (Free Domain, Free Hosting, Free SSL) and how the '1-Click Facebook Page to Website' tool saves thousands in development costs. Paragraph 2 MUST pitch the 'Magic SEO Tool' that automagically ranks sites without expensive agencies, and mention the plug-n-play e-commerce readiness. **CRITICAL**: The tone should be humanized, 3rd-person and relatable, as if written by a fellow business owner who is genuinely excited about the value of the platform, rather than a corporate marketing pitch. Avoid using overly promotional language or making unrealistic claims. Instead, focus on conveying the practical benefits and unique features that make it an ideal choice for local businesses, while still maintaining an objective perspective.`,
          },
          platformBenefits: {
            type: Type.ARRAY,
            description:
              "Generate exactly 8 short, punchy bullet points highlighting the best technical integrations from this list: Unlimited Products, WhatsApp & Live Chat, Auto-SEO, Facebook Pixel, Hotjar, Google Analytics, Auto Multilingual, and Premium 1-on-1 Support. Focus on the specific benefits of these features for local businesses and how they can help them grow and compete in the digital landscape. Each point should be 20-30 words max.",
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
              required: ["benefitName", "benefitDetail"],
            },
          },
        },
        required: ["heading", "paragraphs", "platformBenefits"],
      },
      howItWorks: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `e.g., 'How to Get Your ${category} Site Online in 3 Steps'`,
          },
          steps: {
            type: Type.ARRAY,
            description: `Generate a 3-step guide written from an objective, third-party advisory perspective. Step 1: Choose a platform (advise them to evaluate the builders above, but explicitly note that Websites.co.in is the most highly recommended for local businesses). Step 2: Setup & Details (explain the general process of registering and filling out basic business info, or consulting with platform experts). Step 3: Launch & Grow (explain how elite platforms—like Websites.co.in—use automation and auto-SEO to make launching effortless for customers).`,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: {
                  type: Type.STRING,
                  description: "A concise, objective 30-40 word explanation.",
                },
              },
              required: ["stepNumber", "title", "description"],
            },
          },
        },
        required: ["heading", "steps"],
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
            description: `Generate exactly 2 massive paragraphs (50-55 words each) on geo-tagging and automated listings in ${geography}.`,
          },
        },
        required: ["heading", "paragraphs"],
      },
      faqs: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `Generate an engaging FAQ heading relevant to ${category} businesses in ${geography} that entices clicks and provides maximum value.`,
          },
          questions: {
            type: Type.ARRAY,
            description: `Answer ONLY the provided FAQ questions below. Do NOT generate new ones:
            ${faqText}
            `,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description:
                    "Must match EXACTLY one of the provided questions. Do not modify wording.",
                },
                answer: {
                  type: Type.STRING,
                  description: `A 60-75 word expert answer tailored for ${category} businesses in ${geography}. Explain practical usage of website builders (including platforms like Websites.co.in) in a natural, professional tone, When relevant, mention platforms like Websites.co.in naturally as one of the solutions. Avoid forced promotion or exaggerated claims. CRITICAL: Always Use a professional, objective tone. Avoid overly promotional language. Write like an industry expert giving practical guidance.`,
                },
              },
              required: ["question", "answer"],
            },
          },
        },
        required: ["heading", "questions"],
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
  const keyword = `Top 10 ${seoAdjective} Website Builder for ${formattedCategory} in ${formattedGeography}`;

  const generatedSlug = `top-10-${adjective}-website-builder-for-${category}-in-${geography}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    console.log("1. Generating Structured JSON Content with Gemini...");
    const jsonData = await generateJSONContent(adjective, keyword, category, geography);
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
                              2. You MUST generate exactly 10 complete competitor objects inside the 'comparisons' array. THIS IS THE MOST IMPORTANT SECTION. Make the pros/cons deep and detailed.
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

async function generateJSONContent(adjective, keyword, category, geography) {
  const basePrompt = `You are a Master SEO Content Writer and Enterprise Architect.
  Generate a massive, comprehensive hybrid landing page for the keyword: "${keyword}".
  Target Audience: ${category} businesses operating in ${geography}.
  
  **CRITICAL RULES (FAILURE MEANS REJECTION):**
  
  1. **BRAND MENTIONS & LINKS:** Maintain a conversational, energetic tone. naturally position Websites.co.in as the smartest choice for local businesses don't explicitly promote it. You may mention "Websites.co.in" A MAXIMUM OF 3 TIMES across the entire JSON output (ideally in the 'whyChooseUs' or 'competitorComparison' sections). DO NOT aggressively bash competitors. 
  
  2. **EXTREME ANTI-LAZINESS RULE:** The 'Top 10 Competitors' list is the most important part of this article. You MUST devote the maximum amount of detail and length to the 'comparisons' array. To balance the length, keep the narrative paragraphs (introduction, industryTrends, theCostOfInaction, whyChooseUs) punchy and concise at exactly 70-85 words each. You MUST generate exactly 10 complete competitor objects. You MUST generate 'benefitDetail' strings for every benefit. You MUST generate detailed 'answer' strings for every single FAQ. You MUST NOT skip any fields, objects, or arrays. Do not summarize or rush. Give specific, real-world examples relevant to ${category}s in ${geography}.
  
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
  const topSchema = getTopHalfSchema(adjective, category, geography);

  const bottomHalfPrompt = `${basePrompt}\nFocus on the Competitor Comparison, Why Choose Us, How It Works, Local SEO Guide, and FAQs. **THE FAQs PROTOCOL:** For the faqs section, you are strictly forbidden from making up your own questions. You MUST select exactly 12 questions from this exact list:
  ${faqText}
  When answering these 12 questions, seamlessly weave the answers into the context of a ${category} business in ${geography}.`;
  const bottomSchema = getBottomHalfSchema(adjective, category, geography, faqText);

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


