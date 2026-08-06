'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PolymathViewToggle } from '@/app/components/PolymathViewToggle';
import { PolymathButton } from '@/app/components/PolymathButton';
import { PolymathCard } from '@/app/components/PolymathCard';
import { PolymathFooter } from '@/app/components/PolymathFooter';
import {
  FEATURED_ARTICLES,
  RELATED_ARTICLES,
  RECOMMENDED_RESOURCES,
  ARTICLE_AUTHOR,
} from '@/app/polymath/mockData';

function ArticleDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id') || '1';

  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const article = FEATURED_ARTICLES.find((a) => a.id === articleId) || FEATURED_ARTICLES[0];
  const articleIndex = FEATURED_ARTICLES.findIndex((a) => a.id === articleId);

  useEffect(() => {
    const saved = localStorage.getItem('polymath-view-mode');
    if (saved === 'personalized') {
      setIsPersonalized(true);
    }
  }, []);

  const handleToggle = (personalized: boolean) => {
    setIsPersonalized(personalized);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleNavigateArticle = (newArticleId: string) => {
    router.push(`/polymath/article?id=${newArticleId}`);
  };

  const handleNavigateCard = (cardId: string) => {
    router.push(`/polymath/article?id=${cardId}`);
  };

  const previousArticle = articleIndex > 0 ? FEATURED_ARTICLES[articleIndex - 1] : null;
  const nextArticle = articleIndex < FEATURED_ARTICLES.length - 1 ? FEATURED_ARTICLES[articleIndex + 1] : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Toggle */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#B8A899]/20 px-6 md:px-8 py-4 flex justify-end">
        <PolymathViewToggle onChange={handleToggle} initialState={isPersonalized} />
      </div>

      {/* Article Header Section */}
      <section className="w-full bg-[#F5F3F0] py-12 md:py-16 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <p className="text-xs text-[#B8A899] mb-6">
            Home / Magazine / {article.type.toUpperCase()} / {article.title}
          </p>

          {/* Article Meta Card */}
          <div className="bg-[#D4A574]/20 rounded-lg p-6 md:p-8 mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#8B3A3A] bg-[#8B3A3A]/20 px-3 py-1 rounded mb-4">
              {article.type.toUpperCase()}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-[#8B3A3A] mb-4 font-serif">
              {article.title}
            </h1>

            <p className="text-xs md:text-sm text-[#B8A899] font-semibold">
              By {article.author} | {article.date} | {article.readTime}
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="w-full h-48 md:h-96 bg-gradient-to-br from-[#D4A574] to-[#8B3A3A]/20 rounded-lg flex items-center justify-center text-6xl mb-8">
            {article.emoji}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex gap-8 px-6 md:px-8 py-12 max-w-7xl mx-auto">
        {/* Article Body */}
        <article className={`${isPersonalized ? 'flex-1 max-w-2xl' : 'w-full max-w-2xl mx-auto'}`}>
          {/* Article Introduction */}
          <div className="prose prose-sm md:prose-base max-w-none mb-8">
            <p className="text-base md:text-lg leading-relaxed text-[#3C3C3C] mb-6">
              {article.body || `${article.title} is a fascinating topic that many people are interested in learning more about. This article explores the key concepts, practical applications, and expert insights into this important subject.`}
            </p>

            <h2 className="text-2xl font-bold text-[#8B3A3A] mt-8 mb-4 font-serif">
              Key Concepts & Getting Started
            </h2>

            <p className="text-base leading-relaxed text-[#3C3C3C] mb-6">
              When beginning to explore {article.title.toLowerCase()}, it's important to understand the foundational principles and best practices. This section covers the essentials you need to know before diving deeper.
            </p>

            <blockquote className="border-l-4 border-[#D4A574] bg-[#F5F3F0] px-6 py-4 my-8 italic text-[#B8A899]">
              "The best way to learn is by doing. Start with the fundamentals and gradually build your expertise through consistent practice and real-world application."
            </blockquote>

            <h2 className="text-2xl font-bold text-[#8B3A3A] mt-8 mb-4 font-serif">
              Practical Applications
            </h2>

            <p className="text-base leading-relaxed text-[#3C3C3C] mb-6">
              {article.title} has numerous practical applications in both personal and professional contexts. By understanding and applying these principles, you can enhance your skills and make a meaningful impact in your field.
            </p>

            <h2 className="text-2xl font-bold text-[#8B3A3A] mt-8 mb-4 font-serif">
              Next Steps & Resources
            </h2>

            <p className="text-base leading-relaxed text-[#3C3C3C] mb-6">
              Ready to deepen your knowledge? Explore our curated resources, connect with communities of learners, and start your journey toward mastery. The learning path you choose is unique to your goals and interests.
            </p>
          </div>

          {/* Social Sharing */}
          <div className="bg-[#F5F3F0] rounded-lg p-6 my-8 border border-[#B8A899]/20">
            <h3 className="text-sm font-bold text-[#3C3C3C] mb-4">Share this article</h3>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#B8A899] hover:text-[#8B3A3A] transition-colors">
                𝕏 Twitter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#B8A899] hover:text-[#8B3A3A] transition-colors">
                in LinkedIn
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#B8A899] hover:text-[#8B3A3A] transition-colors">
                📋 Copy Link
              </button>
            </div>
          </div>

          {/* Continue Reading / Related Articles */}
          {(previousArticle || nextArticle) && (
            <div className="my-12 py-8 border-t border-[#B8A899]/20">
              <h3 className="text-lg font-bold text-[#8B3A3A] mb-6 font-serif">Continue Reading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FEATURED_ARTICLES.slice(0, 2).map((relatedArticle) => (
                  <button
                    key={relatedArticle.id}
                    onClick={() => handleNavigateCard(relatedArticle.id)}
                    className="text-left p-4 border border-[#B8A899]/20 rounded hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-xs text-[#B8A899] mb-2 uppercase">
                      {relatedArticle.type}
                    </p>
                    <h4 className="font-semibold text-[#3C3C3C] line-clamp-2">
                      {relatedArticle.title}
                    </h4>
                    <p className="text-xs text-[#B8A899] mt-2">
                      {relatedArticle.author}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4 py-8 border-t border-[#B8A899]/20">
            {previousArticle ? (
              <PolymathButton
                variant="secondary"
                onClick={() => handleNavigateArticle(previousArticle.id)}
              >
                ← Previous
              </PolymathButton>
            ) : (
              <div />
            )}
            {nextArticle && (
              <PolymathButton
                variant="primary"
                onClick={() => handleNavigateArticle(nextArticle.id)}
              >
                Next →
              </PolymathButton>
            )}
          </div>
        </article>

        {/* Personalized Sidebar */}
        {isPersonalized && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-40 bg-[#F5F3F0] border border-[#B8A899]/20 rounded-lg p-6 space-y-6">
              {/* Article Info Bar */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#B8A899]/20">
                <h4 className="text-sm font-bold text-[#3C3C3C] line-clamp-2">
                  {article.title}
                </h4>
                <button
                  onClick={handleSave}
                  className={`text-lg flex-shrink-0 ${isSaved ? 'text-[#8B3A3A]' : 'text-[#B8A899]'}`}
                  aria-label="Save article"
                >
                  {isSaved ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Related from Your Communities */}
              <div>
                <h4 className="text-sm font-bold text-[#3C3C3C] mb-3">
                  Related from Your Communities
                </h4>
                <div className="space-y-2">
                  {RELATED_ARTICLES.slice(0, 3).map((relatedArticle) => (
                    <button
                      key={relatedArticle.id}
                      onClick={() => handleNavigateCard(relatedArticle.id)}
                      className="w-full text-left p-3 bg-white rounded border border-[#B8A899]/20 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      <p className="text-xs font-semibold text-[#3C3C3C] line-clamp-2">
                        {relatedArticle.title}
                      </p>
                      <p className="text-xs text-[#B8A899] mt-1">
                        {relatedArticle.author}
                      </p>
                    </button>
                  ))}
                </div>
                <button className="text-xs text-[#8B3A3A] font-semibold mt-3 hover:underline">
                  See all related →
                </button>
              </div>

              {/* Recommended Resources */}
              <div className="border-t border-[#B8A899]/20 pt-6">
                <h4 className="text-sm font-bold text-[#3C3C3C] mb-3">
                  Recommended Resources
                </h4>
                <div className="space-y-2">
                  {RECOMMENDED_RESOURCES.map((resource) => (
                    <button
                      key={resource.id}
                      className="w-full text-left p-3 bg-white rounded border border-[#B8A899]/20 hover:shadow-sm transition-all"
                    >
                      <div className="flex gap-2">
                        <span className="text-lg flex-shrink-0">{resource.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#3C3C3C] line-clamp-2">
                            {resource.title}
                          </p>
                          <p className="text-xs text-[#B8A899] mt-0.5">
                            {resource.type}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button className="text-xs text-[#8B3A3A] font-semibold mt-3 hover:underline">
                  Browse resource library →
                </button>
              </div>

              {/* About Author */}
              <div className="border-t border-[#B8A899]/20 pt-6">
                <h4 className="text-sm font-bold text-[#3C3C3C] mb-3">About Author</h4>
                <div className="flex gap-3 items-start">
                  <div className="text-3xl flex-shrink-0">
                    {ARTICLE_AUTHOR.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3C3C3C]">
                      {ARTICLE_AUTHOR.name}
                    </p>
                    <p className="text-xs text-[#B8A899] mt-1 line-clamp-2">
                      {ARTICLE_AUTHOR.bio}
                    </p>
                  </div>
                </div>
                <PolymathButton
                  variant="secondary"
                  size="sm"
                  isFullWidth
                  className="mt-3"
                >
                  Follow
                </PolymathButton>
              </div>

              {/* Join Community CTA */}
              <div className="border-t border-[#B8A899]/20 pt-6">
                <h4 className="text-sm font-bold text-[#3C3C3C] mb-2">
                  Join the Community
                </h4>
                <p className="text-xs text-[#B8A899] mb-3">
                  Connect with learners exploring similar topics and access exclusive resources.
                </p>
                <PolymathButton
                  variant="primary"
                  size="sm"
                  isFullWidth
                >
                  Join Community
                </PolymathButton>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <PolymathFooter />
    </main>
  );
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticleDetailContent />
    </Suspense>
  );
}
