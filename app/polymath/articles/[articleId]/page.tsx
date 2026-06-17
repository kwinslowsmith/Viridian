'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Article {
  id: string;
  title: string;
  abstract: string;
  content: string;
  author: { id: string; name: string; email: string };
  community: { id: string; slug: string; name: string };
  publishedAt: string;
  topic: string;
  estimatedReadTime: number;
  coverImage: string;
  polymath_articles_resources: any[];
}

export default function ArticleDetail() {
  const params = useParams();
  const articleId = params.articleId as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // In a real app, this would fetch from an API endpoint that retrieves by ID
        // For now, we'll need to fetch the full magazine and find the article
        const res = await fetch('/api/polymath/magazine?type=articles');
        const data = await res.json();
        const found = data.articles.find((a: Article) => a.id === articleId);
        setArticle(found);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-amber-950 mb-4">Article not found</h1>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/polymath" className="text-amber-700 hover:text-amber-800 text-sm font-medium">
            ← Back to magazine
          </Link>
        </div>
      </header>

      {/* Hero */}
      {article.coverImage && (
        <div className="relative h-96 bg-stone-200 w-full">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-block px-2 py-1 bg-amber-100 text-amber-900 text-xs font-medium rounded">
              Article
            </span>
            {article.topic && (
              <span className="text-sm text-stone-600 capitalize">{article.topic}</span>
            )}
            <span className="text-sm text-stone-600">
              {article.estimatedReadTime} min read
            </span>
          </div>
          <h1 className="text-5xl font-serif text-amber-950 mb-4 leading-tight">
            {article.title}
          </h1>
          {article.abstract && (
            <p className="text-xl text-stone-700 mb-6 leading-relaxed">{article.abstract}</p>
          )}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <div>
              <p className="font-medium text-amber-950">{article.author.name}</p>
              <p className="text-sm text-stone-600">From {article.community.name}</p>
            </div>
            <span className="text-sm text-stone-600">
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Markdown Content */}
        <div className="prose prose-stone max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-serif mt-8 mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-serif mt-6 mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-serif mt-4 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="text-lg leading-relaxed mb-4" {...props} />,
              li: ({ node, ...props }) => <li className="text-lg leading-relaxed mb-2" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-amber-700 pl-4 italic text-stone-700 my-4" {...props} />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Resources */}
        {article.polymath_articles_resources && article.polymath_articles_resources.length > 0 && (
          <section className="border-t border-stone-200 pt-12">
            <h2 className="text-2xl font-serif text-amber-950 mb-6">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.polymath_articles_resources.map((link) => (
                <a
                  key={link.resource.id}
                  href={link.resource.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-stone-200 rounded hover:border-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <p className="font-medium text-amber-950">{link.resource.title}</p>
                  {link.resource.description && (
                    <p className="text-sm text-stone-600 mt-1">{link.resource.description}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Community CTA */}
        <section className="border-t border-stone-200 pt-12 mt-12 text-center">
          <h2 className="text-2xl font-serif text-amber-950 mb-4">
            Join {article.community.name}
          </h2>
          <p className="text-stone-700 mb-6 max-w-lg mx-auto">
            Learn alongside others in this community and track your progress.
          </p>
          <Link
            href={`/discover/${article.community.slug}`}
            className="inline-block px-6 py-3 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium"
          >
            Explore Community
          </Link>
        </section>
      </article>
    </div>
  );
}
