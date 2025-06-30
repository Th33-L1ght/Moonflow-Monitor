'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { sendPasswordReset } from "@/app/actions";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<'idle' | 'pending'>('idle');
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStep('pending');
    setError(null);

    let loginIdentifier = email.trim();
    // If it looks like a username (no @), treat it as a child login.
    if (loginIdentifier && !loginIdentifier.includes('@')) {
        loginIdentifier = `${loginIdentifier.toLowerCase()}@lightflow.app`;
    }

    try {
      await signIn(loginIdentifier, password);
      // On successful sign-in, AuthContext now sets the user and triggers a redirect immediately.
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found') {
          setError("Email/Password sign-in isn't enabled. Please enable it in your Firebase project's Authentication settings.");
      } else if (err.code === 'auth/invalid-credential') {
          setError("Invalid login details. Please double-check and try again.");
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      setLoginStep('idle'); // Reset on error
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
        setError("Please enter both email and password.");
        return;
    }
    setLoginStep('pending');
    setError(null);
    try {
      // In demo mode, signUp just logs the user in.
      if (!isFirebaseConfigured) {
          toast({
              title: "Continuing in Demo Mode",
              description: "Logging you in with a sample parent account.",
          });
          await signIn(email, password);
          return; 
      }

      // Real Firebase flow
      await signUp(email, password);
      toast({
          title: "Account Created",
          description: "Welcome! Logging you in now...",
      });
      // The `signUp` function in AuthContext now handles setting the user state.
      // No need to call signIn again.

    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found') {
          setError("Email/Password sign-in isn't enabled. Please enable it in your Firebase project's Authentication settings.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else {
        setError(err.message);
      }
      setLoginStep('idle');
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    if (!email) {
      setError("Please enter your email address in the field above to reset your password.");
      return;
    }
    if (!email.includes('@')) {
      setError("Password reset is only available for parent accounts with an email address.");
      return;
    }
    
    setLoginStep('pending');
    const result = await sendPasswordReset(email);
    if (result.success) {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    } else {
      setError(result.error || 'An unexpected error occurred.');
    }
    setLoginStep('idle');
  };


  const isLoading = loginStep === 'pending';

  if (isLoading) {
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <h1 className="text-2xl font-bold font-body">Just a moment...</h1>
                <p className="text-muted-foreground">We're getting things ready for you.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center space-y-6">
            <Logo />
            
            <div className="w-full bg-card p-8 rounded-lg border shadow-sm">
              <div className="text-center mb-6">
                <h1 className="font-body text-2xl font-bold">Welcome</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Log in or create an account.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-4">
              {error && (
                  <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Email or Username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-background"
                  autoComplete="username"
                />
              </div>
              <div className="grid gap-2">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                        Forgot password?
                    </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                Login
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleSignUp} disabled={isLoading}>
                Create Parent Account
              </Button>
              </form>
            </div>
        </div>
    </div>
  )
}
