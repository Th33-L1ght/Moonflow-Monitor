'use client';

import React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { AlertTriangle, Info } from 'lucide-react';

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
            The app needs to be connected to a Firebase project to handle user accounts and save data.
          </p>

          <div className="mt-6 rounded-md bg-muted/50 p-4 text-left text-sm">
            <p className="font-semibold text-foreground">
              How to fix this:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to your Firebase project settings in the Firebase Console.</li>
                <li>Under "Your apps", find your web app's configuration keys.</li>
                <li>Copy the six keys (apiKey, authDomain, etc.) into the <code>.env</code> file in your project.</li>
            </ol>
          </div>
          
          <div className="mt-4 rounded-md border border-sky-300/50 bg-sky-50/50 p-4 text-left text-sm">
             <div className="flex items-start gap-3">
                <Info className="h-5 w-5 flex-shrink-0 text-sky-600 mt-0.5"/>
                <div>
                     <h2 className="font-semibold text-sky-800">Already added your AI key?</h2>
                     <p className="text-sky-700 mt-1">
                       Great! The app uses a separate set of keys for Firebase (for login & data) and Google AI (for insights). This screen will disappear once the **Firebase keys** are added to your <code>.env</code> file.
                    </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
