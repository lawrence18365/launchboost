import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCollectionDeals } from '@/lib/pseo-collections';
import CollectionDealsBrowser from '@/components/collection/CollectionDealsBrowser';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await getCollectionDeals(params.slug);

  if (!collection) {
    return {
      title: 'Collection Not Found | IndieSaasDeals',
      description: 'The requested collection could not be found.',
    };
  }

  return {
    title: `${collection.meta.title} | IndieSaasDeals`,
    description: collection.meta.description,
    openGraph: {
      title: collection.meta.title,
      description: collection.meta.description,
    }
  };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollectionDeals(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/deals" className="inline-flex items-center text-black/80 hover:text-black font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight capitalize">
            {collection.meta.title}
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium max-w-3xl mx-auto leading-relaxed">
            {collection.meta.description}
          </p>
        </div>

        {/* Browser Component (Client Side) */}
        <CollectionDealsBrowser initialDeals={collection.deals} title={collection.meta.title} />
      </div>
    </div>
  );
}
