# Website Studio | Smart Website Builder for Local Businesses

[![Built with pollinations.ai](https://img.shields.io/badge/Built_With-pollinations.ai-purple?style=for-the-badge)](https://pollinations.ai)

## Overview

Website Studio is a large-scale platform designed to help local businesses discover the most suitable website-building solutions based on their industry and location.

The platform generates highly targeted, location-specific SEO pages (e.g., “best website builder for plumbers in Texas”) using a fully automated Programmatic SEO (pSEO) system. The goal is to produce and manage tens of thousands of optimized pages efficiently.

The entire system — from keyword ingestion to content generation, storage, and SEO delivery — is designed and implemented as a scalable, automated pipeline.

---

## Key Capabilities

### AI-Driven Content Generation

* Integrates pollinations.ai and Google Gemini APIs
* Generates structured, long-form SEO content
* Enforces strict JSON schemas to ensure frontend stability

### Scalable Background Processing

* Built using BullMQ and Redis
* Handles large volumes of jobs asynchronously
* Includes retry logic, exponential backoff, and rate-limit handling

### SEO Optimization for SPA Architecture

* Custom Express.js layer dynamically injects:

  * Title and meta tags
  * OpenGraph data
  * JSON-LD structured data
* Ensures search engines receive fully optimized HTML

### Automated Indexing

* Dynamically updates:

  * `sitemap.xml`
  * `robots.txt`
* Newly generated pages are immediately discoverable by search engines

### Stability and Data Integrity

* Strict schema validation prevents malformed AI responses
* Global error handling ensures system reliability

### Performance Optimization

* Optimized for high Lighthouse scores
* Uses lazy loading and code splitting
* Image optimization via Cloudinary/Unsplash
* Minimizes layout shifts and improves load times

---

## Technology Stack

**Frontend**

* React.js (Vite)
* Tailwind CSS

**Backend**

* Node.js
* Express.js

**Database and Queue**

* MongoDB (Mongoose)
* Redis
* BullMQ

**AI Integration**

* pollinations.ai
* Google Gemini

**Infrastructure and Security**

* Cloudflare (CDN and protection)
* Helmet (CSP and security headers)

---

## System Architecture

1. Admin inputs keyword combinations (industry + location)
2. Jobs are queued in Redis via BullMQ
3. Worker processes fetch jobs and call AI APIs
4. Content is generated in structured JSON format
5. Data is stored in MongoDB
6. Backend injects SEO metadata into HTML responses
7. Pages are published and added to sitemap automatically

The architecture is decoupled to ensure generation, storage, and delivery operate independently and scale efficiently.

---

## Local Setup

```bash
git clone https://github.com/Necro-Rohan/Website-Studio.git
cd website-studio

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
RENDER_REDIS_URL=your_redis_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
ADMIN_SECRET=your_admin_secret
```

---

## Running the Application

**Backend and Worker**

```bash
cd backend
npm run dev
```

**Frontend**

```bash
cd frontend
npm run dev
```

Application runs at:
[http://localhost:5173](http://localhost:5173)

---

## API Endpoints

* `GET /api/blogs` — Retrieve all blog posts
* `GET /api/blogs/:slug` — Retrieve a specific blog post
* `GET /sitemap.xml` — Generate sitemap dynamically
* `GET /robots.txt` — Generate crawler directives

---

## Credits

AI generation pipeline powered by:
[https://pollinations.ai](https://pollinations.ai)

---

## Author

Rohan Kumar

GitHub: [https://github.com/Necro-Rohan](https://github.com/Necro-Rohan) 

LinkedIn: [https://www.linkedin.com/in/rohan-kumar-2b2ab9326/](https://www.linkedin.com/in/rohan-kumar-2b2ab9326/)

---

## Notes

This project focuses on building scalable systems for automated content generation, handling real-world constraints such as API rate limits, asynchronous processing, and SEO optimization for modern frontend architectures.

