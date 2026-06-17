'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  description: string;
  author: { id: string; name: string; email: string };
  community: { id: string; slug: string; name: string };
  publishedAt: string;
  difficulty: string;
  estimatedHours: number;
  coverImage: string;
  lessons: Array<{ title: string; description: string; estimatedHours: number }>;
  topic: string;
  tags: string;
}

export default function ModuleDetail() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch('/api/polymath/magazine?type=modules');
        const data = await res.json();
        const found = data.modules.find((m: Module) => m.id === moduleId);
        setModule(found);
      } catch (error) {
        console.error('Failed to fetch module:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading module...</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-amber-950 mb-4">Module not found</h1>
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

      {/* Hero */}
      {module.coverImage && (
        <div className="relative h-96 bg-stone-200 w-full">
          <Image
            src={module.coverImage}
            alt={module.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Info */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-900 text-xs font-medium rounded">
              Learning Path
            </span>
            <span className="text-sm text-stone-600">{module.estimatedHours}h</span>
            {module.difficulty && (
              <span className="text-sm text-stone-600 capitalize">{module.difficulty}</span>
            )}
          </div>
          <h1 className="text-5xl font-serif text-amber-950 mb-4 leading-tight">{module.title}</h1>
          {module.description && (
            <p className="text-xl text-stone-700 mb-6 leading-relaxed">{module.description}</p>
          )}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <div>
              <p className="font-medium text-amber-950">{module.author.name}</p>
              <p className="text-sm text-stone-600">From {module.community.name}</p>
            </div>
            <span className="text-sm text-stone-600">
              {new Date(module.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Lessons */}
        {module.lessons && module.lessons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-amber-950 mb-8">Lessons</h2>
            <div className="space-y-4">
              {module.lessons.map((lesson, idx) => (
                <div key={idx} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-amber-950">{lesson.title}</h3>
                    {lesson.estimatedHours && (
                      <span className="text-sm text-stone-600">{lesson.estimatedHours}h</span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-stone-700">{lesson.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center py-12 border-t border-stone-200">
          <h2 className="text-2xl font-serif text-amber-950 mb-4">
            Ready to Start?
          </h2>
          <p className="text-stone-700 mb-6 max-w-lg mx-auto">
            Join {module.community.name} and track your progress through this learning path.
          </p>
          <Link
            href={`/discover/${module.community.slug}`}
            className="inline-block px-6 py-3 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium"
          >
            Start Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
