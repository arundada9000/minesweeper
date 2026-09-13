import { posts } from "@/content/posts";
import type { Post } from "@/content/posts";

export function allPosts(): Post[] {
  return posts;
}

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function relatedPosts(slug: string, count = 3): Post[] {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return [];
  return posts.slice(index + 1, index + 1 + count);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}