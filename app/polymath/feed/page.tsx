'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PolymathSearchBar } from '@/app/components/PolymathSearchBar';
import { PolymathCard } from '@/app/components/PolymathCard';
import { PolymathViewToggle } from '@/app/components/PolymathViewToggle';
import { PolymathFooter } from '@/app/components/PolymathFooter';
import { FEATURED_ARTICLES } from '@/app/polymath/mockData';

export default function MagazineFeedPage() {
  const router = useRouter();
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState(FEATURED_ARTICLES);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;

  useEffect(() => {
    // Load view preference
    const saved = localStorage.getItem('polymath-view-mode');
    if (saved === 'personalized') {
      setIsPersonalized(true);
    }
  }, []);

  const handleToggle = (personalized: boolean) => {
    setIsPersonalized(personalized);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredArticles(FEATURED_ARTICLES);
    } else {
      const filtered = FEATURED_ARTICLES.filter((article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    let filtered = FEATURED_ARTICLES;

    if (filters.topic !== 'all') {
      filtered = filtered.filter((article) =>
        article.type === filters.topic.replace('-', ' ')
      );
    }

    if (filters.type !== 'all') {
      const typeMap: Record<string, string> = {
        'video': 'video',
        'article': 'expertise',
        'lesson-plan': 'resource',
        'tool': 'tool',
        'guide': 'resource',
      };
      const mappedType = typeMap[filters.type];
      if (mappedType) {
        filtered = filtered.filter((article) => article.type === mappedType);
      }
    }

    setFilteredArticles(filtered);
    setCurrentPage(1);
  };

  const handleCardClick = (articleId: string) => {
    router.push(`/polymath/article/${articleId}`);
  };

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky Search & Toggle Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#B8A899]/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-8 py-4">
          <div className="flex-1">
            <PolymathSearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />
          </div>
          <div className="md:absolute md:right-8 md:top-4">
            <PolymathViewToggle onChange={handleToggle} initialState={isPersonalized} />
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="flex gap-8 px-6 md:px-8 py-12 max-w-7xl mx-auto">
        {/* Articles Grid */}
        <div className={isPersonalized ? 'flex-1 max-w-4xl' : 'w-full max-w-6xl mx-auto'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paginatedArticles.map((article) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-[#8B3A3A] text-white'
                      : 'border border-[#B8A899] text-[#3C3C3C] hover:bg-[#F5F3F0]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Personalized Sidebar */}
        {isPersonalized && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-40 bg-[#F5F3F0] border border-[#B8A899]/20 rounded-lg p-6 space-y-8">
              {/* Personalized For You Header */}
              <div>
                <h3 className="text-lg font-bold text-[#8B3A3A] font-serif mb-4">
                  Personalized For You
                </h3>

                {/* Trending Section */}
                <div>
                  <h4 className="text-sm font-bold text-[#3C3C3C] mb-3">
                    Trending in Your Communities
                  </h4>
                  <div className="space-y-2">
                    {FEATURED_ARTICLES.slice(0, 3).map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleCardClick(article.id)}
                        className="w-full text-left p-3 bg-white rounded border border-[#B8A899]/20 hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
                      >
                        <p className="font-semibold text-[#3C3C3C] line-clamp-2">
                          {article.title}
                        </p>
                        <p className="text-xs text-[#B8A899] mt-1">
                          {article.author}
                        </p>
                      </button>
                    ))}
                  </div>
                  <button className="text-xs text-[#8B3A3A] font-semibold mt-3 hover:underline">
                    See all →
                  </button>
                </div>
              </div>

              {/* Continue Learning */}
              <div>
                <h4 className="text-sm font-bold text-[#3C3C3C] mb-3">
                  Continue Learning
                </h4>
                <p className="text-xs text-[#B8A899]">
                  No saved articles yet. Bookmark as you read!
                </p>
                <button className="text-xs text-[#8B3A3A] font-semibold mt-2 hover:underline">
                  Browse all saved
                </button>
              </div>

              {/* Explore More */}
              <div className="border-t border-[#B8A899]/20 pt-6">
                <h4 className="text-sm font-bold text-[#3C3C3C] mb-3">
                  Explore More
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button className="text-[#8B3A3A] hover:underline">
                      Browse all resources →
                    </button>
                  </li>
                  <li>
                    <button className="text-[#8B3A3A] hover:underline">
                      Browse all tools →
                    </button>
                  </li>
                  <li>
                    <button className="text-[#8B3A3A] hover:underline">
                      Your organization's hub →
                    </button>
                  </li>
                  <li>
                    <button className="text-[#8B3A3A] hover:underline">
                      Explore communities →
                    </button>
                  </li>
                </ul>
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
