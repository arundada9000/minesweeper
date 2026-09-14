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
      canonical: `${SITE_URL}/blog/${post.slug}/`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      siteName: "Easy Minesweeper",
      images: [{ url: `/og/${post.slug}.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/og/${post.slug}.png`],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = relatedPosts(post.slug);
  const wordCount = post.body.split(/\s+/).filter(Boolean).length;
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
            dateModified: post.date,
            inLanguage: "en-US",
            wordCount,
            image: `${SITE_URL}/og/${post.slug}.png`,
            author: { "@type": "Person", name: AUTHOR_NAME },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-192.png` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}/` },
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/blog/` },
              { "@type": "ListItem", position: 3, name: post.title },
            ],
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