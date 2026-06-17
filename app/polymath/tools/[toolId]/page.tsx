'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Tool {
  id: string;
  name: string;
  description: string;
  toolType: string;
  author: { id: string; name: string; email: string };
  community: { id: string; slug: string; name: string };
  publishedAt: string;
  toolUrl: string;
  iframeUrl: string;
  thumbnail: string;
  difficulty: string;
  estimatedUsageTime: number;
  languages: string;
  accessibilityFeatures: string;
}

export default function ToolDetail() {
  const params = useParams();
  const toolId = params.toolId as string;
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await fetch('/api/polymath/magazine?type=tools');
        const data = await res.json();
        const found = data.tools.find((t: Tool) => t.id === toolId);
        setTool(found);
      } catch (error) {
        console.error('Failed to fetch tool:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [toolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading tool...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-amber-950 mb-4">Tool not found</h1>
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Info */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-900 text-xs font-medium rounded">
              Tool
            </span>
            <span className="text-sm text-stone-600 capitalize">{tool.toolType}</span>
            {tool.difficulty && (
              <span className="text-sm text-stone-600 capitalize">{tool.difficulty}</span>
            )}
            {tool.estimatedUsageTime && (
              <span className="text-sm text-stone-600">{tool.estimatedUsageTime} min</span>
            )}
          </div>
          <h1 className="text-5xl font-serif text-amber-950 mb-4 leading-tight">{tool.name}</h1>
          {tool.description && (
            <p className="text-xl text-stone-700 mb-6 leading-relaxed">{tool.description}</p>
          )}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <div>
              <p className="font-medium text-amber-950">{tool.author.name}</p>
              <p className="text-sm text-stone-600">From {tool.community.name}</p>
            </div>
            <span className="text-sm text-stone-600">
              {new Date(tool.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tool Preview */}
        {tool.iframeUrl ? (
          <div className="mb-8 border border-stone-200 rounded-lg overflow-hidden bg-white">
            <div className="aspect-video bg-stone-100">
              <iframe
                src={tool.iframeUrl}
                className="w-full h-full"
                title={tool.name}
                allow="fullscreen"
              />
            </div>
          </div>
        ) : tool.thumbnail ? (
          <div className="mb-8 relative h-96 bg-stone-200 rounded-lg overflow-hidden">
            <Image
              src={tool.thumbnail}
              alt={tool.name}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        {/* Open Tool Button */}
        {(tool.toolUrl || tool.iframeUrl) && (
          <div className="mb-12 text-center">
            <a
              href={tool.toolUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Open Tool
            </a>
          </div>
        )}

        {/* Tool Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-8 bg-white rounded-lg border border-stone-200">
          {tool.languages && (
            <div>
              <h3 className="font-medium text-amber-950 mb-2">Languages</h3>
              <p className="text-stone-700">{tool.languages}</p>
            </div>
          )}
          {tool.accessibilityFeatures && (
            <div>
              <h3 className="font-medium text-amber-950 mb-2">Accessibility</h3>
              <p className="text-stone-700">{tool.accessibilityFeatures}</p>
            </div>
          )}
        </div>

        {/* Community CTA */}
        <section className="text-center py-12 border-t border-stone-200">
          <h2 className="text-2xl font-serif text-amber-950 mb-4">
            Learn More in {tool.community.name}
          </h2>
          <p className="text-stone-700 mb-6 max-w-lg mx-auto">
            Discover related tools, articles, and learning paths in this community.
          </p>
          <Link
            href={`/discover/${tool.community.slug}`}
            className="inline-block px-6 py-3 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium"
          >
            Explore Community
          </Link>
        </section>
      </div>
    </div>
  );
}
