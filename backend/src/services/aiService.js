import { GoogleGenAI, Type } from "@google/genai";
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
  const result = [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
  return [...new Set(result)]; // to avoid duplicates
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

const selectedFAQs = generateFAQsDynamic();

const faqText = selectedFAQs.map((q, i) => `${i + 1}. ${q}`).join("\n");

const competitorPool = [
  "Wix", "WordPress", "Shopify", "Squarespace", "Weebly", "GoDaddy",
  "Webflow", "Duda", "Jimdo", "Zyro", "Site123", "Strikingly",
  "Hostinger", "BigCommerce", "Carrd", "Framer", "Dorik", "Webnode",
  "Ghost", "Elementor", "Pixpa", "HubSpot CMS", "WooCommerce",
  "Magento", "PrestaShop", "Volusion", "Shift4Shop", "Bubble",
  "Glide", "Softr"
];

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

const selectedCompetitors = [...new Set(shuffle(competitorPool))].slice(0, 10); // the 10 random compititors

const competitorsText = selectedCompetitors
  .map((c, i) => `${i + 2}. ${c}`)
  .join("\n");

const styles = [
  "use-case driven",
  "problem-solution",
  "comparison-focused",
  "local-business focused",
  "feature breakdown",
  "performance-focused",
  "beginner-friendly explanation",
];

function pickRandomstyle(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const randomStyle = pickRandomstyle(styles);

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

        TITLE FORMAT VARIANTS(You don't have to follow these verbatim, but they should be SIMILAR in STYLE and STRUCTURE. The key is to randomize and not repeat the same format across articles, so don't just pick directly from this list every time, use it as inspiration to create similar engaging titles that fit the character limit, also Please don't just favour the first 2 formats, make sure to use all of them to create diverse titles across different articles, The examples below are just to illustrate the style and structure, do not copy them exactly, create similar variations that feel natural and engaging):

        1. "10 Best ${category} Website Builders in ${geography} (2026)"
        2. "Best Website Builders for ${category} in ${geography} - Compared"
        3. "${category} Website Builders in ${geography}: Top Picks & Costs"
        4. "In ${geography}, The Best Website Builder for ${category} is... (2026 Guide)"
        5. "${category} Website Builders in ${geography} (Pricing + Features)"

        IMPORTANT:
        - Use numbers in only 2-3 variants (not all)
        - Avoid repeating the same structure across pages
        - Keep it punchy, clickable, and natural
        - Always add a modifier like the year, "Compared", "Guide", "Picks", or "Pricing" to make it more engaging and less generic.`,
      },
      metaDescription: {
        type: Type.STRING,
        description: `
        Write a compelling meta description **strictly under 155-160 characters**.

        CRITICAL:
        - MUST include ${category} and ${geography}
        - Focus on helping users choose the right website builder
        - Highlight comparison, insights, or decision-making value

        STYLE:
        - Write in a natural, human tone (not robotic)
        - Use varied phrasing across pages
        - Avoid repeating patterns like "Discover the best" or "Find the top 10"
        - Create curiosity or urgency where appropriate

        DO NOT:
        - mention specific brand names
        - sound overly promotional or exaggerated
        - repeat the same structure across pages

        GOAL:
        The description should feel like a helpful preview that makes the user want to click and explore the comparison.
        `,
      },
      hero: {
        type: Type.OBJECT,
        properties: {
          h1: {
            type: Type.STRING,
            description: `
          Generate a high-CTR, natural-sounding H1 headline for a comparison article about website builders.

          CRITICAL:
          - MUST include ${category} and ${geography}
          - SHOULD include the adjective '${adjective}' naturally
          - MUST feel human-written and engaging
          - SHOULD NOT always start with "Top 10" or "Best"
          - Vary structure across pages (list, question, comparison, insight)

          ALLOWED STYLES (use variation, DO NOT copy exactly):
          - "Best ${adjective} Website Builders for ${category}s in ${geography}"
          - "${category} Website Builders in ${geography}: What Actually Works"
          - "Which ${adjective} Website Builder Fits ${category}s in ${geography}?"
          - "${adjective} Website Builders ${category}s in ${geography} Should Consider"
          - "A Practical Comparison of Website Builders for ${category}s in ${geography}"

          IMPORTANT:
          - DO NOT repeat patterns across pages
          - DO NOT sound templated
          - Keep it concise and compelling
          `,
          },
          paragraphs: {
            type: Type.STRING,
            description: `
            Write a concise (35-40 words) introductory paragraph for this comparison article.

            CRITICAL:
            - Focus on helping ${category} businesses in ${geography} choose the right website builder
            - Clearly indicate that multiple platforms have been analyzed and compared
            - DO NOT use identical phrasing like "we reviewed and ranked"
            - DO NOT mention specific brand names
            - Keep tone professional, neutral, and informative

            STYLE GUIDELINES:
            - Write like an expert advisor, not a marketer
            - Vary sentence structure across pages
            - Avoid repetitive openings (e.g., "This guide...", "In this article...")
            - Make it feel tailored to ${category} businesses in ${geography}

            GOAL:
            The paragraph should immediately communicate value, relevance, and clarity to the reader without sounding templated.
            `,
          },
        },
        required: ["h1", "paragraphs"],
      },
      introduction: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `Generate a clear, engaging intro heading for ${category} businesses in ${geography}. It should feel editorial, specific, and useful. Avoid always using the same opening pattern.`,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Generate 3 natural paragraphs of 50-60 words each. 
            The introduction should:
            - explain why ${category} businesses in ${geography} need the right website builder
            - mention the practical factors being compared, such as ease of use, SEO, booking, pricing, and scalability
            - feel specific to this niche and location
            - avoid repetitive template language
            - sound like a helpful expert, not a marketing script
            - Contain words count between 50-60 words per paragraph to ensure depth without overwhelming the reader.`,
          },
        },
        required: ["heading", "paragraphs"],
      },
      industryTrends: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `
            Generate a relevant, insight-driven heading about current trends affecting ${category} businesses in ${geography}.
            Avoid generic phrases like "digital transformation". Make it feel specific, modern, and tailored to the industry.
            `,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `
            Write 2-3 concise paragraphs (35-55 words each) explaining real-world trends affecting ${category} businesses in ${geography}.

            CRITICAL:
            - Focus on practical changes (e.g., online bookings, mobile-first users, local SEO, customer expectations)
            - Tie trends directly to ${category} workflows and challenges
            - Reference how businesses in ${geography} are adapting

            DO NOT:
            - use generic phrases like "digital transformation is important"
            - repeat the same ideas across paragraphs
            - sound like a generic business article

            STYLE:
            - Write like an industry analyst explaining real shifts
            - Keep it specific, relevant, and grounded in real-world use cases

            GOAL:
            The reader should feel: "Yes, this reflects what's actually happening in my industry and city."
            `,
          },
        },
        required: ["heading", "paragraphs"],
      },
      theCostOfInaction: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `
            Generate a compelling heading that highlights the risks and missed opportunities for ${category} businesses in ${geography} without an effective website.

            Avoid generic phrases. Make it specific, practical, and relevant to real-world business challenges.
            `,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `
            Write 2-3 concise paragraphs (40-60 words each) explaining the practical consequences of not having a well-optimized website for ${category} businesses in ${geography}.

            CRITICAL:
            - Focus on real-world scenarios (missed bookings, lost leads, poor visibility, manual processes)
            - Tie directly to ${category}-specific workflows
            - Reference how customers in ${geography} search and make decisions

            DO NOT:
            - invent statistics or fake percentages
            - use vague claims like "businesses lose revenue"
            - repeat generic statements across paragraphs

            STYLE:
            - Write like an industry expert highlighting practical risks
            - Keep tone informative, grounded, and realistic

            GOAL:
            The reader should clearly understand what they are missing out on and why having the right website matters in their specific market.
            `,
          },
        },
        required: ["heading", "paragraphs"],
      },
      features: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `
            Generate a clear, relevant heading describing essential website features for ${category} businesses in ${geography}.

            Avoid generic phrasing. Make it feel tailored to the industry and practical needs.
            `,
          },
          list: {
            type: Type.ARRAY,
            description: `
            Generate 5-7 highly relevant features required for a ${category} website.

            CRITICAL:
            - Each feature MUST be specific to ${category} workflows
            - Focus on real operational needs (e.g., booking systems, inventory display, lead capture, scheduling)
            - Avoid generic features like "fast loading" or "SEO tools" unless tied to a real use case
            - Include variation in features across different pages

            CATEGORY + GEO REQUIREMENT:
            - Each feature should reflect how ${category} businesses operate
            - Where possible, reference how businesses in ${geography} use these features

            DESCRIPTION RULES:
            - Each description must be 30-40 words
            - Must explain:
              → why the feature matters
              → how it is used in real-world scenarios

            STYLE:
            - Write like a practical guide for business owners
            - Avoid repetitive phrasing across features
            - Vary sentence structure

            ICON KEYWORD:
            - Provide a simple, relevant keyword representing the feature (e.g., "booking", "analytics", "store", "calendar")

            GOAL:
            The reader should clearly understand what features they actually need to run their ${category} business online effectively.
            `,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
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


function getBottomHalfSchema(adjective, category, geography, faqText, competitorsText, randomStyle) {
  return {
    type: Type.OBJECT,
    properties: {
      competitorComparison: {
        type: Type.OBJECT,
        properties: {
          heading: {
            type: Type.STRING,
            description: `
            Generate an engaging, high-CTR heading for a ranked comparison of website builders for ${category} businesses in ${geography}.

            IMPORTANT:
            - The heading must feel natural and human-written
            - Avoid repeating common patterns like always starting with "Top 10" or "Best"
            - Vary structure and phrasing across pages
            - Optimize for click-through rate (CTR)

            Here are EXAMPLES of acceptable styles (DO NOT copy, use as inspiration only):

            - "Best Website Builders for ${category}s in ${geography} (Compared)"
            - "${category} Website Builders in ${geography}: Top Picks & Pricing"
            - "Which Website Builder Works Best for ${category}s in ${geography}?"
            - "${adjective} Website Builders for ${category}s in ${geography}"
            - "Top Platforms for ${category} Businesses in ${geography}"

            CRITICAL:
            - Do NOT repeat these examples exactly
            - Generate a unique variation each time
            `,
          },
          comparisons: {
            type: Type.ARRAY,
            description: `
            Generate a ranked comparison using 7-11 platforms from the provided list in CRITICAL INPUT.

            CRITICAL INPUT:
            Use ONLY these competitors:
            1. Websites.co.in
            ${competitorsText}

            STRICT RULES:
            - Websites.co.in must be included and typically ranked highly (though not always #1, it can be ranked 1 or 2 to maintain credibility, but it should always be in the top 2 to reflect its strong value proposition for local businesses)
            - Use a ${randomStyle} overall framing for this page's comparison section, and explicitly apply a different style to each platform's analysis to ensure unique voices and avoid templated content.
            - Each platform should still vary its tone and structure
            - Do NOT introduce any platform outside the provided list
            - Do NOT include URLs or promotional language
            - Focus on objective strengths and weaknesses for each platform based on realistic features and limitations for ${category} businesses in ${geography}
            - Each platform sould have a completely UNIQUE writing style and analysis to ensure the content feels independently written and not generated from a template. Vary tone, structure, and sentence openings across platforms to create distinct voices for each one.
            - Make sure you don't always pick 7 or 8 competitors, sometimes pick 9, 10, 11 or 12 to create more variation across articles.

            CRITICAL WRITING RULES:
            - Each platform MUST have a completely UNIQUE writing style
            - Each analysis MUST feel like it was written independently
            - Vary tone, structure, and sentence openings across platforms

            STYLE VARIATION:
            For EACH platform, randomly use a different style such as:
            - use-case driven
            - problem-solution
            - comparison-focused
            - local-business focused
            - feature breakdown

            IMPORTANT:
            Explicitly apply a DIFFERENT style to each platform.

            CATEGORY + GEO REQUIREMENT:
            - Every platform analysis SHOULD reference ${category} businesses
            - Every platform MUST include at least one real-world use case in ${geography}

            Example:
            "For sports teams in ${geography}, managing registrations and schedules..."

            ANTI-REPETITION RULES:
            DO NOT:
            - start sentences repeatedly with "Offers", "Provides", "Includes"
            - reuse sentence structures across platforms
            - write generic SaaS descriptions
            - repeat phrasing patterns

            CONTENT REQUIREMENTS:

            For each platform:

            theGood:
            - 3-5 points
            - Each point must be 30-45 words
            - Each point must include:
              → a category-specific need
              → a real-world use case

            theBad:
            - 2-3 points
            - Each point must be 25-40 words
            - Focus on realistic limitations for ${category} businesses

            STRUCTURE FLEXIBILITY:
            - Mix bullet-style and paragraph-style naturally
            - Do NOT make all platforms identical in format

            GOAL:
            Each platform must feel like a completely different expert analysis tailored for ${category} businesses in ${geography}.
            `,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: {
                  type: Type.NUMBER,
                  description:
                    "The ranking position of the platform in this comparison (1 for the best, 2 for second-best, etc.)",
                },
                platformName: {
                  type: Type.STRING,
                  description: `The name of the platfroms being compared from the list Websites.co.in and ${competitorsText} `,
                },
                theGood: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: `
                  Return 3-5 distinct strengths as an array of strings.

                  STRICT RULES:
                  - Each item MUST be a single standalone point (NOT a paragraph containing multiple points)
                  - DO NOT use numbering (1., 2., etc.) or bullet symbols (-, •)
                  - Each point must be 30-45 words
                  - Each point MUST include:
                    → one ${category}-specific need
                    → one real-world use case in ${geography}

                  STYLE:
                  - Each platform must use a DIFFERENT writing style
                  - Vary sentence openings (avoid repeating patterns like "Offers", "Provides")
                  - Make each point feel independently written

                  GOAL:
                  Each item should render cleanly as a UI bullet point without additional parsing.
                  `,
                },

                theBad: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: `
                  Return 2-3 distinct weaknesses as an array of strings.

                  STRICT RULES:
                  - Each item MUST be a single standalone limitation
                  - DO NOT use numbering or bullet symbols
                  - Each point must be 25-40 words
                  - Focus on realistic drawbacks for ${category} businesses in ${geography}

                  STYLE:
                  - Vary tone and sentence structure across platforms
                  - Avoid repeating phrasing patterns

                  GOAL:
                  Each item should render cleanly as a UI bullet point.
                  `,
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
              "Generate a clear, confident heading explaining why Websites.co.in is a strong option for local businesses. Avoid exaggerated or sales-heavy language.",
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Generate exactly 2 humanized, concise paragraphs (40-50 words each).

            Paragraph 1:
            - Explain the practical value of free domain, hosting, and SSL
            - Mention the 1-Click Facebook Page to Website tool naturally
            - Focus on saving time and setup cost for local businesses

            Paragraph 2:
            - Explain the value of SEO tools, e-commerce readiness, and simple management
            - Keep the tone helpful and credible, not promotional
            - Avoid making ranking guarantees or unrealistic claims

            Style:
            - Sound like a practical recommendation from an experienced advisor
            - Use a warm but objective tone
            - Avoid hype phrases like "best ever", "automagically", or "ultimate solution"`,
          },
          platformBenefits: {
            type: Type.ARRAY,
            description: `Generate exactly 6-8 short benefit bullets.

            Rules:
            - Each benefit must be practical and specific
            - Focus on real business outcomes, not buzzwords
            - Tie each feature to a clear advantage for local businesses
            - Avoid exaggerated promises about rankings or growth`,
            items: {
              type: Type.OBJECT,
              properties: {
                benefitName: {
                  type: Type.STRING,
                  description:
                    "A short feature name, like 'Auto-SEO Setup' or 'WhatsApp Chat'",
                },
                benefitDetail: {
                  type: Type.STRING,
                  description:
                    "A concise explanation of how that feature helps local businesses in practice.",
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
            description: `Generate a clear, practical heading that explains how ${category} businesses in ${geography} can get a website live. Keep it concise, useful, and non-promotional.`,
          },
          steps: {
            type: Type.ARRAY,
            description: `Generate 3 steps that explain the process from choosing a platform to launching the site.

            CRITICAL:
            - Write from an objective, advisory perspective
            - Explain the practical workflow for ${category} businesses in ${geography}
            - Mention platforms like Websites.co.in naturally when relevant, but do not force promotion
            - Vary the wording of the steps across pages
            - Keep each step concise and actionable
            - Generate EXACTLY 3 steps (no more, no less).
            - stepNumber MUST be 1, 2, and 3 in order

            Suggested flow:
            1. Choose the right platform
            2. Add business details and content
            3. Launch, optimize, and maintain the site`,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: {
                  type: Type.NUMBER,
                  description: "The step number in the process (1, 2, or 3)",
                },
                title: {
                  type: Type.STRING,
                  description: "A concise title for this step (4-6 words)",
                },
                description: {
                  type: Type.STRING,
                  description: `
                  Write a concise explanation (around 30-40 words).

                  GUIDELINES:
                  - Aim for approximately 30-40 words (do not strictly count)
                  - Focus on what the business owner should do and why it matters
                  - Keep it clear, natural, and readable

                  IMPORTANT:
                  - Do not artificially stretch or compress sentences just to hit a word count
                  `,
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
            description: `
            Generate a practical, insight-driven heading about local SEO for ${category} businesses in ${geography}.

            Avoid generic phrases. Make it feel relevant and specific to how businesses actually get discovered locally.
            `,
          },
          paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `
            Write 2-3 concise paragraphs (40-50 words each) explaining how ${category} businesses in ${geography} can improve their local search visibility.

            CRITICAL:
            - Cover multiple aspects of local SEO:
              → Google Business Profile optimization
              → local keywords and landing pages
              → reviews and reputation
              → mobile search behavior
              → structured data / listings

            - Tie every point to real-world behavior in ${geography}
            - Explain how customers actually search and choose businesses

            DO NOT:
            - focus only on "geo-tagging"
            - repeat generic SEO advice
            - use vague phrases like "improve rankings"

            STYLE:
            - Write like a local SEO expert giving practical insights
            - Keep it grounded, actionable, and relevant

            GOAL:
            The reader should understand how local SEO works in their specific market and what actually drives visibility.
            `,
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

    // Enforce Websites.co.in ranking rules in the competitor comparison

    function enforceWebsitesRanking(comparisons) {
      const index = comparisons.findIndex(
        (c) =>
          c.platformName &&
          c.platformName.toLowerCase().trim() === "websites.co.in",
      );

      if (index === -1) return comparisons;
      if (index === 0) return comparisons;

      // clone array to avoid mutation
      const newComparisons = [...comparisons];

      const [website] = newComparisons.splice(index, 1);

      // always insert at rank 1
      newComparisons.unshift(website);

      return newComparisons.map((item, i) => ({
        ...item,
        rank: i + 1,
      }));
    }

    jsonData.competitorComparison.comparisons = enforceWebsitesRanking(
      jsonData.competitorComparison.comparisons,
    );


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
          // POLLINATIONS AI LOGIC
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
  const bottomSchema = getBottomHalfSchema(adjective, category, geography, faqText, competitorsText, randomStyle);

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


