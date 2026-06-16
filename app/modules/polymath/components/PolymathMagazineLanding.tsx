'use client';

import React, { useState } from 'react';

// Editorial color palette: warm, inviting
const colors = {
  cream: '#F7F4EE',
  burgundy: '#8B1A2E',
  gold: '#B8962E',
  sage: '#9CAF88',
  taupe: '#8B8680',
  charcoal: '#2C2420',
  white: '#FFFFFF',
};

// Sample content
const featuredContent = [
  {
    id: '1',
    type: 'expertise-series',
    title: 'How to Get Into Woodworking',
    subtitle: 'A three-part journey from hobby to mastery',
    author: 'Sarah Chen',
    parts: 3,
    readTime: '8 min read',
    image: '🪵',
  },
  {
    id: '2',
    type: 'resource',
    title: 'AP US History Unit 1 Lesson Plans',
    author: 'Match Charter High School',
    description: 'Complete 4-week curriculum for Period 1',
    resourceType: 'Lesson Plans',
  },
  {
    id: '3',
    type: 'tool',
    title: 'El Lector Diario — Spanish Learning',
    description: 'Daily Spanish reader with audio and vocabulary',
    language: 'Spanish (B1-B2)',
    access: 'Open Access',
  },
  {
    id: '4',
    type: 'spotlight',
    title: 'Building a Sustainable Food System',
    subtitle: 'Resources from urban farming communities',
    author: 'Community Garden Coalition',
    resourceCount: '23 resources',
  },
];

export function PolymathMagazineLanding() {
  const [isLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<'browse' | 'article' | 'tool'>('browse');

  if (activeView === 'article') {
    return (
      <ArticleView
        onBack={() => setActiveView('browse')}
        title="How to Get Into Woodworking"
        part={1}
        content="Woodworking is an ancient craft that combines technical skill with creative vision. Whether you're drawn to furniture making, instrument building, or home renovation, the journey begins with understanding the fundamentals..."
      />
    );
  }

  if (activeView === 'tool') {
    return <ToolView onBack={() => setActiveView('browse')} />;
  }

  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh' }}>
      {/* Navigation */}
      <nav
        style={{
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.taupe}20`,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: '700', color: colors.burgundy }}>
          Polymath Magazine
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a style={{ color: colors.charcoal, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Browse
          </a>
          <a style={{ color: colors.charcoal, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Tools
          </a>
          <a style={{ color: colors.charcoal, textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Resources
          </a>
          <button
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: colors.burgundy,
              color: colors.white,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          borderBottom: `2px solid ${colors.gold}20`,
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '700',
            color: colors.burgundy,
            margin: '0 0 1rem 0',
            fontFamily: 'Georgia, serif',
          }}
        >
          Discover How People Become Experts
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: colors.taupe,
            margin: '0 0 2rem 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6',
          }}
        >
          Explore expertise journeys, tools, and resources from communities and organizations shaping the future of learning.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: colors.burgundy,
              color: colors.white,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Start Exploring
          </button>
          <button
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              border: `2px solid ${colors.burgundy}`,
              backgroundColor: 'transparent',
              color: colors.burgundy,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Search/Filter */}
      <div style={{ padding: '2rem', backgroundColor: colors.white, borderBottom: `1px solid ${colors.taupe}20` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search expertise, resources, tools..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: `1px solid ${colors.taupe}40`,
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      {/* Magazine Feed */}
      <div style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.charcoal,
              margin: '0 0 2rem 0',
              fontFamily: 'Georgia, serif',
            }}
          >
            Featured Content
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {featuredContent.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'expertise-series') setActiveView('article');
                  if (item.type === 'tool') setActiveView('tool');
                }}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `1px solid ${colors.taupe}20`,
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 16px ${colors.charcoal}10`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Card Image Area */}
                {item.type === 'expertise-series' && (
                  <div
                    style={{
                      padding: '2rem',
                      backgroundColor: colors.gold + '20',
                      fontSize: '48px',
                      textAlign: 'center',
                      borderBottom: `1px solid ${colors.taupe}20`,
                    }}
                  >
                    {item.image}
                  </div>
                )}

                {/* Card Content */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '3px',
                        backgroundColor:
                          item.type === 'expertise-series'
                            ? colors.burgundy + '20'
                            : item.type === 'tool'
                              ? colors.sage + '20'
                              : colors.gold + '20',
                        color:
                          item.type === 'expertise-series'
                            ? colors.burgundy
                            : item.type === 'tool'
                              ? colors.sage
                              : colors.gold,
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.type === 'expertise-series' ? 'Expertise Path' : item.type === 'tool' ? 'Tool' : item.type === 'resource' ? 'Resource' : 'Spotlight'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: colors.charcoal,
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {item.title}
                  </h3>

                  {'subtitle' in item && (
                    <p style={{ fontSize: '13px', color: colors.taupe, margin: '0 0 0.5rem 0' }}>
                      {item.subtitle}
                    </p>
                  )}

                  {'description' in item && (
                    <p style={{ fontSize: '13px', color: colors.taupe, margin: '0 0 0.5rem 0' }}>
                      {item.description}
                    </p>
                  )}

                  <div style={{ fontSize: '12px', color: colors.taupe, marginTop: '1rem' }}>
                    {'author' in item && <div>{item.author}</div>}
                    {'readTime' in item && <div>{item.readTime}</div>}
                    {'language' in item && <div>{item.language}</div>}
                    {'resourceType' in item && <div>{item.resourceType}</div>}
                  </div>
                </div>

                {/* Card CTA */}
                <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${colors.taupe}20` }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: 'none',
                      backgroundColor: colors.burgundy,
                      color: colors.white,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                    }}
                  >
                    {item.type === 'tool' ? 'Open Tool' : item.type === 'resource' ? 'View Resource' : 'Read Article'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: colors.charcoal, color: colors.cream, padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ margin: '0' }}>© 2026 Polymath Magazine. Part of the Viridian learning ecosystem.</p>
      </footer>
    </div>
  );
}

function ArticleView({ onBack, title, part, content }: { onBack: () => void; title: string; part: number; content: string }) {
  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '2rem' }}>
      <button
        onClick={onBack}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: colors.taupe,
          color: colors.white,
          cursor: 'pointer',
          marginBottom: '2rem',
        }}
      >
        ← Back to Magazine
      </button>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ backgroundColor: colors.gold + '20', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          <p style={{ color: colors.gold, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: 0 }}>Part {part} of 3</p>
          <h1 style={{ fontSize: '32px', color: colors.burgundy, margin: '0.5rem 0 0 0', fontFamily: 'Georgia, serif' }}>
            {title}
          </h1>
        </div>

        <article style={{ backgroundColor: colors.white, padding: '2rem', borderRadius: '8px', lineHeight: '1.8' }}>
          <p style={{ color: colors.charcoal, fontSize: '16px', margin: 0 }}>
            {content}
          </p>

          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: colors.cream, borderRadius: '6px' }}>
            <h3 style={{ color: colors.burgundy, fontSize: '14px', margin: '0 0 0.5rem 0' }}>Ready to dive deeper?</h3>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.burgundy,
                color: colors.white,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Join a Woodworking Community
            </button>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.taupe}20` }}>
            <h4 style={{ color: colors.charcoal, fontSize: '14px', fontWeight: '600' }}>Navigation</h4>
            <button
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                backgroundColor: colors.burgundy + '20',
                color: colors.burgundy,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              ← Part 1: Breaking In
            </button>
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: colors.burgundy,
                color: colors.white,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Part 2: Subcommunities →
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

function ToolView({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ backgroundColor: colors.cream, minHeight: '100vh', padding: '2rem' }}>
      <button
        onClick={onBack}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: colors.taupe,
          color: colors.white,
          cursor: 'pointer',
          marginBottom: '2rem',
        }}
      >
        ← Back to Magazine
      </button>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Tool Info */}
          <div>
            <h1 style={{ fontSize: '32px', color: colors.burgundy, margin: '0 0 1rem 0', fontFamily: 'Georgia, serif' }}>
              El Lector Diario
            </h1>
            <p style={{ fontSize: '16px', color: colors.taupe, margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
              A daily Spanish language reader with audio pronunciation, vocabulary building, and grammar conjugations. Perfect for B1-B2 learners.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '12px', color: colors.taupe, fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                  Language
                </p>
                <p style={{ fontSize: '14px', color: colors.charcoal, margin: '0.5rem 0 0 0' }}>Spanish (B1-B2)</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: colors.taupe, fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                  Format
                </p>
                <p style={{ fontSize: '14px', color: colors.charcoal, margin: '0.5rem 0 0 0' }}>Interactive Web App</p>
              </div>
            </div>

            <button
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: colors.burgundy,
                color: colors.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                marginBottom: '1rem',
              }}
            >
              Open Tool
            </button>

            <div style={{ backgroundColor: colors.gold + '20', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
              <p style={{ color: colors.gold, fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', margin: 0 }}>
                Open Access
              </p>
              <p style={{ color: colors.taupe, fontSize: '12px', margin: '0.5rem 0 0 0' }}>Free for all learners</p>
            </div>
          </div>

          {/* Tool Preview */}
          <div
            style={{
              backgroundColor: colors.white,
              borderRadius: '8px',
              padding: '1.5rem',
              border: `1px solid ${colors.taupe}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>📖</div>
              <p style={{ color: colors.taupe, fontSize: '14px' }}>Tool Preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
