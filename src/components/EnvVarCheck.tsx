'use client';

import React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { AlertTriangle } from 'lucide-react';

export function EnvVarCheck({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg rounded-lg border-2 border-dashed border-destructive/50 bg-card p-8 text-center">
          <div className="mx-auto w-fit rounded-full bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-bold font-headline text-card-foreground">
            Configuration Needed
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your app's API keys are missing. Please provide them to connect to
            your backend services.
          </p>
          <div className="mt-6 rounded-md bg-muted/50 p-4 text-left text-sm">
            <p>
              To fix this, say:{' '}
              <strong className="text-foreground">"Set up my API keys"</strong>{' '}
              and I will guide you through the process securely.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              These keys are required for user login (Firebase) and AI features
              (Gemini).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
