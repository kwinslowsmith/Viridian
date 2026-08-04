'use client';

import React from 'react';
import { PolymathButton } from './PolymathButton';

interface PolymathHeroProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const PolymathHero: React.FC<PolymathHeroProps> = ({
  title = 'Discover How People Become Experts',
  subtitle = 'Explore expertise journeys, tools, and resources from communities and organizations shaping the future of learning.',
  primaryCtaText = 'Start Exploring',
  secondaryCtaText = 'Learn More',
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <section className="w-full bg-[#F5F3F0] py-16 md:py-24 lg:py-32 px-6 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#8B3A3A] mb-4 md:mb-6 leading-tight font-serif">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#B8A899] mb-8 md:mb-12 leading-relaxed font-serif max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <PolymathButton
            variant="primary"
            size="lg"
            onClick={onPrimaryClick}
          >
            {primaryCtaText}
          </PolymathButton>
          <PolymathButton
            variant="secondary"
            size="lg"
            onClick={onSecondaryClick}
          >
            {secondaryCtaText}
          </PolymathButton>
        </div>
      </div>
    </section>
  );
};
