import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/server/db'

// This generates static paths at build time for SEO
export async function generateStaticParams() {
  const supabase = createServerComponentClient()
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
  
  return posts?.map((post) => ({
    slug: post.slug,
  })) || []
}

// This generates metadata for each blog post (crucial for SEO)
export async function generateMetadata({ params }) {
  const supabase = createServerComponentClient()
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, description, created_at')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.created_at,
    },
  }
}

// Server-side rendering ensures Google can crawl the content
export default async function BlogPost({ params }) {
  const supabase = createServerComponentClient()
  
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-brand">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-8">
          {post.title}
        </h1>
        
        <div className="text-black/60 mb-8">
          Published on {new Date(post.created_at).toLocaleDateString()}
        </div>
        
        <div className="prose prose-lg max-w-none text-black/80">
          {/* Render markdown or HTML content */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <div className="mt-12 p-6 bg-yellow-100 border-2 border-black rounded-xl">
          <h3 className="text-xl font-bold text-black mb-4">
            💰 Find More SaaS Deals
          </h3>
          <p className="text-black/80 mb-4">
            Looking for exclusive discounts on indie SaaS tools? 
            Browse our curated collection of deals for startup founders.
          </p>
          <a 
            href="/deals" 
            className="bg-black text-yellow-400 px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors inline-block"
          >
            Browse All Deals →
          </a>
        </div>
      </div>
    </div>
  )
}