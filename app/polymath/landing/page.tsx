'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PolymathHero } from '@/app/components/PolymathHero';
import { PolymathSearchBar } from '@/app/components/PolymathSearchBar';
import { PolymathCard } from '@/app/components/PolymathCard';
import { PolymathFooter } from '@/app/components/PolymathFooter';
import { FEATURED_ARTICLES } from '@/app/polymath/mockData';

export default function LandingPage() {
  const router = useRouter();

  const handleStartExploring = () => {
    router.push('/polymath/feed');
  };

  const handleLearnMore = () => {
    router.push('/polymath/feed');
  };

  const handleCardClick = (articleId: string) => {
    router.push(`/polymath/article/${articleId}`);
  };

  const featuredCards = FEATURED_ARTICLES.slice(0, 4);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <PolymathHero
        onPrimaryClick={handleStartExploring}
        onSecondaryClick={handleLearnMore}
      />

      {/* Search & Filter Bar */}
      <PolymathSearchBar />

      {/* Featured Content Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#3C3C3C] mb-8 md:mb-12 font-serif">
            Featured Content
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredCards.map((article) => (
              <PolymathCard
                key={article.id}
                type={article.type}
                title={article.title}
                description={article.description}
                author={article.author}
                readTime={article.readTime}
                emoji={article.emoji}
                metadata={`${article.author} | ${article.readTime}`}
                ctaText={
                  article.type === 'tool' ? 'Open Tool' :
                  article.type === 'resource' ? 'View Resource' :
                  article.type === 'spotlight' ? 'Explore Spotlight' :
                  'Read Article'
                }
                onClick={() => handleCardClick(article.id)}
              />
            ))}
          </div>

          {/* Explore More CTA */}
          <div className="mt-12 md:mt-16 text-center">
            <button
              onClick={handleStartExploring}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#8B3A3A] text-white rounded font-semibold hover:bg-[#75302D] transition-colors"
            >
              Explore All Content
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PolymathFooter />
    </main>
  );
}
