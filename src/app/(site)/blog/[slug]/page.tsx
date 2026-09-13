import { allPosts, getPost, relatedPosts } from "@/lib/posts";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { AdSlot } from "@/components/site/AdSlot";
import { SITE_NAME, AUTHOR_NAME, SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return allPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Easy Minesweeper`,
    description: post.description,
    alternates: {
      canonical: `https://easyminesweeper.vercel.app/blog/${post.slug}/`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      siteName: "Easy Minesweeper",
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = relatedPosts(post.slug);
  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { "@type": "Person", name: AUTHOR_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME },
            mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
          }),
        }}
      />
      <ArticleLayout post={post} related={related} />
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 sm:px-6">
        <AdSlot variant="leaderboard" />
      </div>
    </div>
  );
}