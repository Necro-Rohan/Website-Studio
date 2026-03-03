import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../utils/api.js"

export default function BlogPage() {
const { slug } = useParams();
const [post, setPost] = useState(null);
const [error, setError] = useState(false);

useEffect(() => {
api.get(`/blog/${slug}`)
  .then(res => setPost(res.data))
  .catch(() => setError(true));
}, [slug]);

if (error) return "Post not found.";
if (!post) return "Loading Content...";

return (
  <>
    <h1>{post.h1}</h1>
    <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
  </>
);
}