'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Collection {
  id: string;
  name: string;
  description: string;
  author: { id: string; name: string; email: string };
  community: { id: string; slug: string; name: string };
  publishedAt: string;
  coverImage: string;
  topic: string;
  tags: string;
  resources: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    url: string;
    fileName: string;
  }>;
}

export default function CollectionDetail() {
  const params = useParams();
  const collectionId = params.collectionId as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await fetch('/api/polymath/magazine?type=collections');
        const data = await res.json();
        const found = data.collections.find((c: Collection) => c.id === collectionId);
        setCollection(found);
      } catch (error) {
        console.error('Failed to fetch collection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading collection...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-amber-950 mb-4">Collection not found</h1>
          <Link href="/polymath" className="text-amber-700 hover:text-amber-800">
            ← Back to magazine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/polymath" className="text-amber-700 hover:text-amber-800 text-sm font-medium">
            ← Back to magazine
          </Link>
        </div>
      </header>

      {/* Hero */}
      {collection.coverImage && (
        <div className="relative h-96 bg-stone-200 w-full">
          <Image
            src={collection.coverImage}
            alt={collection.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Info */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-900 text-xs font-medium rounded">
              Collection
            </span>
            <span className="text-sm text-stone-600">
              {collection.resources?.length || 0} resources
            </span>
            {collection.topic && (
              <span className="text-sm text-stone-600 capitalize">{collection.topic}</span>
            )}
          </div>
          <h1 className="text-5xl font-serif text-amber-950 mb-4 leading-tight">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-xl text-stone-700 mb-6 leading-relaxed">{collection.description}</p>
          )}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <div>
              <p className="font-medium text-amber-950">{collection.author.name}</p>
              <p className="text-sm text-stone-600">From {collection.community.name}</p>
            </div>
            <span className="text-sm text-stone-600">
              {new Date(collection.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Resources Grid */}
        {collection.resources && collection.resources.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-amber-950 mb-8">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collection.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-amber-950 flex-1">{resource.title}</h3>
                    <span className="text-xs text-stone-600 capitalize whitespace-nowrap ml-2">
                      {resource.type}
                    </span>
                  </div>
                  {resource.description && (
                    <p className="text-sm text-stone-600">{resource.description}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center py-12 border-t border-stone-200">
          <h2 className="text-2xl font-serif text-amber-950 mb-4">
            Explore {collection.community.name}
          </h2>
          <p className="text-stone-700 mb-6 max-w-lg mx-auto">
            Find more curated resources and learning materials in this community.
          </p>
          <Link
            href={`/discover/${collection.community.slug}`}
            className="inline-block px-6 py-3 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium"
          >
            Visit Community
          </Link>
        </div>
      </div>
    </div>
  );
}
