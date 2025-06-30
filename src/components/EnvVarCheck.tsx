'use client';

import React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function EnvVarCheck({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl space-y-6">
            <div className="text-center">
                 <div className="mx-auto w-fit rounded-full bg-destructive/10 p-4 text-destructive mb-4">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold font-body text-card-foreground">
                    Final Step: Connect Your Firebase Project
                </h1>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                    To save data and enable user login, you must copy your project's API keys into the editor. This uses the free Spark plan.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>How to Get Your Keys</CardTitle>
                    <CardDescription>Follow these steps in the Firebase Console website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <span className="font-semibold text-sm">1. Open the Firebase Console and go to your project.</span>
                        <p className="text-xs text-muted-foreground mb-2">If you don't have a project, click "Create a project".</p>
                        <Button asChild variant="secondary" size="sm">
                            <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Open Firebase Console
                            </a>
                        </Button>
                    </div>
                     <div>
                        <span className="font-semibold text-sm">2. Register a Web App with your project.</span>
                        <p className="text-xs text-muted-foreground">You won't see your code files here. This step just creates a connection to get your keys. In your project, go to Project Settings (⚙️ icon), scroll to "Your apps", and click the Web icon (<code>&lt;/&gt;</code>). Give it a nickname and click <strong>Register app</strong>.</p>
                    </div>
                    <div>
                        <span className="font-semibold text-sm">3. Copy the configuration keys.</span>
                        <p className="text-xs text-muted-foreground">On the next screen, you'll see the `firebaseConfig` object. Copy the values.</p>
                    </div>
                    <div>
                        <span className="font-semibold text-sm">4. Paste the keys into your <code>.env</code> file.</span>
                        <p className="text-xs text-muted-foreground">In the editor on the left, open the <code>.env</code> file and paste your keys into the placeholders shown below.</p>
                        <pre className="mt-2 w-full overflow-x-auto rounded-md bg-muted p-3 text-xs">
                        <code>
{`GOOGLE_API_KEY="YOUR_GOOGLE_AI_KEY_HERE"

NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
`}
                        </code>
                        </pre>
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
