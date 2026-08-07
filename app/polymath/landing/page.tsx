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

  const handleCreateContent = (type: string) => {
    router.push('/test/polymath-posting');
  };

  const handleBrowseContent = (type: string) => {
    router.push(`/polymath?type=${type}`);
  };

  const featuredCards = FEATURED_ARTICLES.slice(0, 4);

  const contentTypes = [
    {
      id: 'articles',
      icon: '📄',
      title: 'Articles',
      description: 'In-depth guides, tutorials, and thought leadership pieces',
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'tools',
      icon: '🛠️',
      title: 'Tools',
      description: 'Interactive utilities, calculators, and productivity helpers',
      color: 'bg-green-50 border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'modules',
      icon: '📚',
      title: 'Learning Modules',
      description: 'Structured courses and comprehensive learning paths',
      color: 'bg-purple-50 border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'collections',
      icon: '✨',
      title: 'Collections',
      description: 'Curated collections of resources on specific topics',
      color: 'bg-amber-50 border-amber-200',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <PolymathHero
        onPrimaryClick={handleStartExploring}
        onSecondaryClick={handleLearnMore}
      />

      {/* Search & Filter Bar */}
      <PolymathSearchBar />

      {/* Content Types Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 px-6 md:px-8 bg-gradient-to-b from-white to-stone-50">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3C3C3C] mb-3 font-serif">
              Explore by Content Type
            </h2>
            <p className="text-[#B8A899] text-lg max-w-2xl">
              Polymath offers multiple ways to learn and share knowledge. Choose what interests you most.
            </p>
          </div>

          {/* Content Type Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((type) => (
              <div
                key={type.id}
                className={`border-2 rounded-lg p-6 transition-all hover:shadow-lg ${type.color}`}
              >
                {/* Icon */}
                <div className="text-4xl mb-4">{type.icon}</div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-[#3C3C3C] mb-2 font-serif">
                  {type.title}
                </h3>
                <p className="text-sm text-[#B8A899] mb-6 leading-relaxed">
                  {type.description}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBrowseContent(type.id)}
                    className="flex-1 px-4 py-2 bg-white border-2 border-current text-[#3C3C3C] rounded font-semibold text-sm hover:bg-[#F5F3F0] transition-colors"
                  >
                    Browse
                  </button>
                  <button
                    onClick={() => handleCreateContent(type.id)}
                    className={`flex-1 px-4 py-2 ${type.buttonColor} text-white rounded font-semibold text-sm transition-colors`}
                  >
                    Create
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
