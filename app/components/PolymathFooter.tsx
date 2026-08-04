'use client';

import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const defaultColumns: FooterColumn[] = [
  {
    heading: 'About',
    links: [
      { label: 'Our Mission', href: '#' },
      { label: 'About Viridian', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Browse Tools', href: '#' },
      { label: 'Resource Library', href: '#' },
      { label: 'Learning Paths', href: '#' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Become a Curator', href: '#' },
      { label: 'Submit Article', href: '#' },
      { label: 'Join Slack', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Accessibility', href: '#' },
    ],
  },
];

interface PolymathFooterProps {
  columns?: FooterColumn[];
}

export const PolymathFooter: React.FC<PolymathFooterProps> = ({
  columns = defaultColumns,
}) => {
  return (
    <footer className="w-full bg-[#3C3C3C] text-[#F5F3F0] py-12 md:py-16 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-bold mb-4 text-[#F5F3F0]">
                {column.heading}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#F5F3F0] hover:text-[#D4A574] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#F5F3F0]/20 pt-8">
          {/* Copyright */}
          <p className="text-xs text-center text-[#F5F3F0]/60">
            © 2026 Polymath Magazine. Part of the Viridian learning ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
};
