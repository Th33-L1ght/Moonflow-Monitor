'use client';

import React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function EnvVarCheck({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl rounded-lg border-2 border-dashed border-destructive/50 bg-card p-8 text-center">
          <div className="mx-auto w-fit rounded-full bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-bold font-body text-card-foreground">
            Firebase Configuration Needed
          </h1>
          <p className="mt-2 text-muted-foreground">
            To save data and enable user login, you must connect your Firebase project.
          </p>

          <Alert className="mt-6 text-left">
            <Info className="h-4 w-4" />
            <AlertTitle>Two Different Places!</AlertTitle>
            <AlertDescription>
                <p>You are currently in **Firebase Studio**, the code editor.</p>
                <p className="mt-2">To get your API keys, you need to go to the **Firebase Console**, which is a separate website for managing your project.</p>
                <Button asChild variant="secondary" size="sm" className="mt-3">
                    <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4"/>
                        Open Firebase Console
                    </a>
                </Button>
            </AlertDescription>
          </Alert>

          <div className="mt-6 rounded-md bg-muted/50 p-4 text-left text-sm">
            <p className="font-semibold text-foreground">
              How to fix this:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to the Firebase Console website (use the button above).</li>
                <li>In your project, go to <strong>Project settings</strong> (the ⚙️ icon).</li>
                <li>Scroll to <strong>Your apps</strong>. If you don't see an app, click the Web icon (<code>&lt;/&gt;</code>), give it a name, and click <strong>Register app</strong>.</li>
                <li>Select your web app to find its configuration keys under <strong>SDK setup and configuration</strong>.</li>
                <li>
                  Copy the six keys into the <code>.env</code> file in this editor.
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

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
