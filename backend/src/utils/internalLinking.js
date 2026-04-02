export function scorePost(current, candidate) {
  let score = 0;
  if (current.category === candidate.category) score += 5;
  if (current.geography === candidate.geography) score += 4;
  return score;
}

export function generateInternalLinks(currentPost, allPosts) {
  const filtered = allPosts.filter((p) => p.slug !== currentPost.slug);

  const scored = filtered.map((post) => ({
    post,
    score: scorePost(currentPost, post),
  }));

  scored.sort((a, b) => b.score - a.score);

  const extractData = (s) => ({
    slug: s.post.slug,
    h1: s.post.h1,
    thumbnail: s.post.coverImage || null, 
  });

  return {
    sameCategory: scored
      .filter((s) => s.post.category === currentPost.category)
      .slice(0, 3)
      .map(extractData),

    sameGeography: scored
      .filter((s) => s.post.geography === currentPost.geography)
      .slice(0, 3)
      .map(extractData),

    crossCategory: scored
      .filter((s) => s.post.category !== currentPost.category)
      .slice(0, 2)
      .map(extractData),
  };
}
