import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";
import { slugifyStr } from "./slugify";

export type Tag = {
  tag: string;
  tagName: string;
  count: number;
};

/**
 * Builds a de-duplicated, sorted tag list from posts with post count.
 *
 * - Drafts and scheduled posts are excluded via `postFilter()`
 * - `tag` is the slug used in URLs; `tagName` is the original label for display
 * - `count` is the number of posts tagged with this tag
 * - Uniqueness is based on the slug (so differently-cased labels collapse)
 */
export function getUniqueTags(posts: CollectionEntry<"posts">[]): Tag[] {
  const filteredPosts = posts.filter(postFilter);
  const tagCountMap = new Map<
    string,
    { tag: string; tagName: string; count: number }
  >();

  for (const post of filteredPosts) {
    // Unique tags in this post (prevent duplicate counting if post has duplicate tags)
    const postTagSlugs = new Set<string>();
    for (const rawTag of post.data.tags) {
      const slug = slugifyStr(rawTag);
      if (postTagSlugs.has(slug)) continue;
      postTagSlugs.add(slug);

      const existing = tagCountMap.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        tagCountMap.set(slug, {
          tag: slug,
          tagName: rawTag,
          count: 1,
        });
      }
    }
  }

  return Array.from(tagCountMap.values()).sort((tagA, tagB) =>
    tagA.tag.localeCompare(tagB.tag)
  );
}
