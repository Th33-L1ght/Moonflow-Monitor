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
            Firebase Configuration Needed
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your Firebase API keys are missing from the <code>.env</code> file. These are required for user login and saving data.
          </p>
          <div className="mt-6 rounded-md bg-muted/50 p-4 text-left text-sm">
            <p className="font-semibold text-foreground">
              How to fix this:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Find your Firebase project settings in the Firebase Console.</li>
                <li>Under "Your apps", find your web app configuration.</li>
                <li>Copy the keys into the <code>.env</code> file in your project.</li>
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              If you've already added your Google AI key, that's great! The AI features will be active once the app is running. This screen will disappear once the Firebase keys are correctly configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
