import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Blog – IndieSaasDeals",
  description: "Founder-first insights on launching, growth, and community.",
};

export const dynamic = 'force-dynamic'

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-brand">
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
              IndieSaasDeals Blog
            </h1>
            <p className="text-lg md:text-xl text-black/80 font-medium max-w-3xl mx-auto">
              Real, founder-first notes on launching, growth, and building in public.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.length === 0 && (
              <div className="col-span-2">
                <div className="bg-white border-2 border-black rounded-2xl p-8 text-center">
                  <p className="text-black/80 font-medium">No posts yet. Check back soon.</p>
                </div>
              </div>
            )}
            {posts.map((post) => {
              const date = post.published_at
                ? new Date(post.published_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: '2-digit',
                  })
                : ''
              const primaryTag = post.tags && post.tags.length > 0 ? post.tags[0] : 'Article'

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block relative bg-white border-2 border-black rounded-2xl p-6 md:p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <Badge className="bg-black text-yellow-400 border-2 border-black px-3 py-1 font-bold text-[11px]">
                      #{primaryTag}
                    </Badge>
                    <span className="text-black/70 font-semibold text-xs md:text-sm">{date}</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-black/80 font-medium mb-5 leading-relaxed">
                    {post.excerpt ?? ''}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 mb-6 flex flex-wrap gap-2">
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] md:text-xs bg-black text-yellow-400 font-bold px-2 py-0.5 rounded-full border-2 border-black"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between pt-4 border-t-2 border-black">
                    <span className="text-black/80 font-semibold text-xs md:text-sm">
                      {post.author_name ?? 'IndieSaasDeals Team'}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-black text-yellow-400 font-bold px-3 py-1 rounded-full border-2 border-black group-hover:bg-gray-900 transition-colors">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
