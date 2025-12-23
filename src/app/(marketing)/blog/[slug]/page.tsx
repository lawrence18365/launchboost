import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Twitter } from "lucide-react";
import { ShareButton } from "@/components/blog/ShareButton";

type Params = { params: { slug: string } };

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: Params) {
  const post = await getPostBySlug(params.slug);
  if (!post || post.status !== 'published') return notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://indiesaasdeals.com'
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`
  const shareText = encodeURIComponent(`${post.title} — IndieSaasDeals`)
  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(canonicalUrl)}&via=ezysyntax`
  const readingMinutes = (() => {
    try {
      const text = post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const words = text ? text.split(' ').length : 0
      return Math.max(1, Math.round(words / 200))
    } catch { return 3 }
  })()
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: '2-digit',
      })
    : ''
  const primaryTag = post.tags && post.tags.length > 0 ? post.tags[0] : 'Article'

  return (
    <div className="min-h-screen bg-brand">
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/blog"
              className="inline-block text-sm font-bold text-black hover:underline"
            >
              ← Back to Blog
            </Link>
          </div>
          <article className="bg-white border-2 border-black rounded-2xl p-6 md:p-10 shadow-xl">
            <header className="mb-6 md:mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-black text-yellow-400 border-2 border-black px-3 py-1 font-bold text-[11px]">#{primaryTag}</Badge>
                  {post.tags?.slice(1, 3).map((t) => (
                    <span key={t} className="text-[10px] md:text-xs bg-white text-black font-bold px-2 py-0.5 rounded-full border-2 border-black">#{t}</span>
                  ))}
                </div>
                <span className="text-black/70 font-semibold text-xs md:text-sm">{date} • {readingMinutes} min read</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-black leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-3 text-black/80 font-medium leading-relaxed">{post.excerpt}</p>
              )}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t-2 border-black">
                <span className="text-black/80 font-semibold text-sm">{post.author_name ?? 'IndieSaasDeals Team'}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-black text-yellow-400 font-bold px-3 py-1 rounded-full border-2 border-black hover:bg-gray-900 transition-colors"
                  >
                    <Twitter className="h-4 w-4" /> Share
                  </Link>
                  <ShareButton url={canonicalUrl} />
                </div>
              </div>
            </header>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t-2 border-black">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-black text-yellow-400 font-bold px-2 py-1 rounded-full border-2 border-black"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
