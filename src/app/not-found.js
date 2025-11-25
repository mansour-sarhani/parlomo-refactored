'use client';

import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

/**
 * Custom 404 Not Found page
 * Shown when user navigates to a route that doesn't exist
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <Card className="max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4">
          {/* 404 Icon */}
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          {/* 404 Message */}
          <div>
            <h1 className="text-6xl font-bold text-[var(--color-primary)] mb-2">
              404
            </h1>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Page Not Found
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Link href="/" className="flex-1">
              <Button variant="primary" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

