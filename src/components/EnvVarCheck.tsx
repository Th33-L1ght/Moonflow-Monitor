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
          <h1 className="mt-6 text-2xl font-bold font-body text-card-foreground">
            Firebase Configuration Needed
          </h1>
          <p className="mt-2 text-muted-foreground">
            To save data and enable user login, you need to connect your Firebase project.
          </p>

          <div className="mt-6 rounded-md bg-muted/50 p-4 text-left text-sm">
            <p className="font-semibold text-foreground">
              How to fix this:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to your Firebase project settings.</li>
                <li>Scroll to **Your apps**. If you don't see an app, click the Web icon (`</>`), give it a name, and click **Register app**.</li>
                <li>Select your web app to find its configuration keys under **SDK setup and configuration**.</li>
                <li>
                  Copy the six keys into the <code className="font-mono bg-muted-foreground/20 px-1 py-0.5 rounded">.env</code> file in your project, like this:
                </li>
            </ol>
            <pre className="mt-2 w-full overflow-x-auto rounded-md bg-background p-3 text-xs">
              <code>
{`GOOGLE_API_KEY="YOUR_GOOGLE_AI_KEY_HERE"

NEXT_PUBLIC_FIREBASE_API_KEY="AI..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
`}
              </code>
            </pre>
          </div>
          
          <div className="mt-4 rounded-md border border-sky-300/50 bg-sky-50/50 p-4 text-left text-sm">
             <div className="flex items-start gap-3">
                <Info className="h-5 w-5 flex-shrink-0 text-sky-600 mt-0.5"/>
                <div>
                     <h2 className="font-semibold text-sky-800">Have an AI Key already?</h2>
                     <p className="text-sky-700 mt-1">
                       Great! This screen will disappear once the six **Firebase keys** are also added to your <code className="font-mono bg-sky-200/50 px-1 py-0.5 rounded">.env</code> file.
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
