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

  const sameCategory = scored
    .filter((s) => s.post.category === currentPost.category)
    .slice(0, 3)
    .map(extractData);

  const sameGeography = scored
    .filter((s) =>
        s.post.geography === currentPost.geography &&
        s.post.category !== currentPost.category)
    .slice(0, 3)
    .map(extractData);

  const used = new Set([
    ...sameCategory.map((p) => p.slug),
    ...sameGeography.map((p) => p.slug),
  ]);

  const crossCategory = scored
    .filter((s) =>
        s.post.category !== currentPost.category &&
        !used.has(s.post.slug) &&
        (s.post.geography === currentPost.geography || s.score > 0))
    .slice(0, 2)
    .map(extractData);

  return {
    sameCategory,
    sameGeography,
    crossCategory,
  };
}