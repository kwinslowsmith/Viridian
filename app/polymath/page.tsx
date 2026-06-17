'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Article {
  id: string;
  type: 'article';
  title: string;
  abstract: string;
  community: { id: string; slug: string; name: string };
  author: { id: string; name: string };
  publishedAt: string;
  topic: string;
  estimatedReadTime: number;
  coverImage: string;
}

interface Tool {
  id: string;
  type: 'tool';
  name: string;
  description: string;
  community: { id: string; slug: string; name: string };
  author: { id: string; name: string };
  publishedAt: string;
  toolType: string;
  thumbnail: string;
  difficulty: string;
  estimatedUsageTime: number;
}

interface Module {
  id: string;
  type: 'module';
  title: string;
  description: string;
  community: { id: string; slug: string; name: string };
  author: { id: string; name: string };
  publishedAt: string;
  difficulty: string;
  estimatedHours: number;
  coverImage: string;
}

interface Collection {
  id: string;
  type: 'collection';
  name: string;
  description: string;
  community: { id: string; slug: string; name: string };
  author: { id: string; name: string };
  publishedAt: string;
  coverImage: string;
  resources: any[];
}

type ContentItem = Article | Tool | Module | Collection;

export default function PolymathMagazine() {
  const [content, setContent] = useState<{
    articles: Article[];
    tools: Tool[];
    modules: Module[];
    collections: Collection[];
  }>({ articles: [], tools: [], modules: [], collections: [] });
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    fetchMagazineContent();
  }, [selectedTopic]);

  const fetchMagazineContent = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/polymath/magazine', window.location.origin);
      if (selectedTopic) {
        url.searchParams.append('topic', selectedTopic);
      }
      const res = await fetch(url.toString());
      const data = await res.json();

      // Ensure data has the expected structure
      if (
        data &&
        typeof data === 'object' &&
        ('articles' in data || 'tools' in data || 'modules' in data || 'collections' in data)
      ) {
        setContent({
          articles: Array.isArray(data.articles) ? data.articles : [],
          tools: Array.isArray(data.tools) ? data.tools : [],
          modules: Array.isArray(data.modules) ? data.modules : [],
          collections: Array.isArray(data.collections) ? data.collections : [],
        });
      } else {
        console.error('Invalid API response structure:', data);
        setContent({ articles: [], tools: [], modules: [], collections: [] });
      }
    } catch (error) {
      console.error('Failed to fetch magazine content:', error);
      setContent({ articles: [], tools: [], modules: [], collections: [] });
    } finally {
      setLoading(false);
    }
  };

  const topics = [
    'education',
    'career',
    'life-skills',
    'creative',
    'professional-development',
  ];

  const allContent = [
    ...content.articles,
    ...content.tools,
    ...content.modules,
    ...content.collections,
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-serif font-bold text-amber-900">
              Polymath
            </div>
            <span className="text-sm text-stone-600">Magazine</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-stone-700 hover:text-amber-900 font-medium text-sm"
            >
              All
            </button>
            <a href="#" className="text-stone-700 hover:text-amber-900 text-sm">
              Discover
            </a>
            <a href="#" className="text-stone-700 hover:text-amber-900 text-sm">
              Tools
            </a>
            <a
              href="/auth/signin"
              className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 text-sm font-medium"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-stone-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-serif text-amber-950 mb-6 leading-tight">
            Discover How People Become Experts
          </h1>
          <p className="text-xl text-stone-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Learn from practitioners, educators, and communities building mastery. Read expertise journeys,
            use interactive tools, and join learning communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="text"
              placeholder="Search articles, tools, and learning paths..."
              className="flex-1 px-4 py-3 rounded border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            <button className="px-6 py-3 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium text-sm whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Topic Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-stone-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedTopic === null
                ? 'bg-amber-700 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            All Topics
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors capitalize ${
                selectedTopic === topic
                  ? 'bg-amber-700 text-white'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {/* Magazine Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12 text-stone-600">Loading magazine...</div>
        ) : allContent.length === 0 ? (
          <div className="text-center py-12 text-stone-600">
            No content published yet in this topic.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allContent.map((item) => (
              <ContentCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-amber-900 text-white py-16 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-4">Build Your Expertise</h2>
          <p className="text-lg mb-8 text-amber-100">
            Join learning communities, track your progress, and discover personalized learning paths.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-3 bg-white text-amber-900 rounded font-medium hover:bg-stone-100 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const baseClasses =
    'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col';

  if (item.type === 'article') {
    return (
      <Link href={`/polymath/articles/${item.id}`}>
        <div className={baseClasses}>
          {item.coverImage && (
            <div className="relative h-40 bg-stone-200">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-900 text-xs font-medium rounded">
                Article
              </span>
              <span className="text-xs text-stone-500">
                {item.estimatedReadTime} min read
              </span>
            </div>
            <h3 className="text-lg font-serif text-amber-950 mb-2 leading-tight flex-1">
              {item.title}
            </h3>
            <p className="text-sm text-stone-600 mb-4 flex-1">{item.abstract}</p>
            <div className="flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-stone-200">
              <span>{item.community.name}</span>
              <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (item.type === 'tool') {
    return (
      <Link href={`/polymath/tools/${item.id}`}>
        <div className={baseClasses}>
          {item.thumbnail && (
            <div className="relative h-40 bg-stone-200">
              <Image
                src={item.thumbnail}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-900 text-xs font-medium rounded">
                Tool
              </span>
              {item.difficulty && (
                <span className="text-xs text-stone-500 capitalize">{item.difficulty}</span>
              )}
            </div>
            <h3 className="text-lg font-serif text-amber-950 mb-2 leading-tight flex-1">
              {item.name}
            </h3>
            <p className="text-sm text-stone-600 mb-4 flex-1">{item.description}</p>
            <div className="flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-stone-200">
              <span>{item.community.name}</span>
              <span>Open Access</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (item.type === 'module') {
    return (
      <Link href={`/polymath/modules/${item.id}`}>
        <div className={baseClasses}>
          {item.coverImage && (
            <div className="relative h-40 bg-stone-200">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-900 text-xs font-medium rounded">
                Learning Path
              </span>
              <span className="text-xs text-stone-500">{item.estimatedHours}h</span>
            </div>
            <h3 className="text-lg font-serif text-amber-950 mb-2 leading-tight flex-1">
              {item.title}
            </h3>
            <p className="text-sm text-stone-600 mb-4 flex-1">{item.description}</p>
            <div className="flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-stone-200">
              <span>{item.community.name}</span>
              <span className="capitalize">{item.difficulty || 'beginner'}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (item.type === 'collection') {
    return (
      <Link href={`/polymath/collections/${item.id}`}>
        <div className={baseClasses}>
          {item.coverImage && (
            <div className="relative h-40 bg-stone-200">
              <Image
                src={item.coverImage}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-900 text-xs font-medium rounded">
                Collection
              </span>
              <span className="text-xs text-stone-500">
                {item.resources?.length || 0} items
              </span>
            </div>
            <h3 className="text-lg font-serif text-amber-950 mb-2 leading-tight flex-1">
              {item.name}
            </h3>
            <p className="text-sm text-stone-600 mb-4 flex-1">{item.description}</p>
            <div className="flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-stone-200">
              <span>{item.community.name}</span>
              <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null;
}
