import { createServerComponentClient } from '@/lib/server/db'
import { Database } from '@/types/supabase'

type BlogRow = Database['public']['Tables']['blog_posts']['Row']

export async function getPublishedPosts(): Promise<BlogRow[]> {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function getPostBySlug(slug: string): Promise<BlogRow | null> {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

