
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from "@/lib/firebase/client";
import { logError } from "@/lib/error-logging";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    clearForm();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (mode === 'login') {
      await handleLogin();
    } else {
      await handleSignUp();
    }

    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!isFirebaseConfigured) {
        setError("Firebase is not configured. Please add your credentials to the .env file.");
        return;
    }

    let loginIdentifier = email.trim();
    if (loginIdentifier && !loginIdentifier.includes('@')) {
        loginIdentifier = `${loginIdentifier.toLowerCase()}@lightflow.app`;
    }

    try {
      await signIn(loginIdentifier, password);
    } catch (err: any) {
      logError(err, { location: 'LoginPage.handleLogin', loginIdentifier });
      if (err.code === 'auth/configuration-not-found') {
          setError("Email/Password sign-in isn't enabled in your Firebase project.");
      } else if (err.code === 'auth/invalid-credential') {
          setError("Incorrect email or password. Please try again, or use the 'Forgot Password?' link.");
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    }
  };

  const handleSignUp = async () => {
    if (!isFirebaseConfigured) {
        setError("Firebase is not configured. Please add your credentials to the .env file.");
        return;
    }
    if (!email.includes('@')) {
        setError("Please use a valid email address to create a parent account.");
        return;
    }

    try {
      await signUp(email, password);
      toast({
          title: "Account Created!",
          description: "We've sent a welcome email to verify your address.",
      });
    } catch (err: any)      {
      logError(err, { location: 'LoginPage.handleSignUp', email });
      if (err.code === 'auth/configuration-not-found') {
          setError("Email/Password sign-in isn't enabled in your Firebase project.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address you entered is not valid.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    if (!auth) {
        setError("Authentication service is not available.");
        return;
    }
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    if (!email.includes('@')) {
      setError("Password reset is only available for parent accounts with an email address.");
      return;
    }
    
    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Password Reset Email Sent",
            description: "Check your inbox for instructions to reset your password.",
        });
    } catch (error: any) {
        logError(error, { location: 'LoginPage.handlePasswordReset', email });
        setError(error.message || 'Failed to send password reset email.');
    }
    setIsLoading(false);
  };

  if (isLoading && !error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h1 className="text-2xl font-bold font-body">Just a moment...</h1>
          <p className="text-muted-foreground">We're getting things ready for you.</p>
        </div>
      </div>
    );
  }

  const emailLabel = mode === 'login' ? 'Email or Username' : 'Email Address';
  const emailPlaceholder = mode === 'login' ? 'you@example.com or username' : 'you@example.com';

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center space-y-6">
        <Logo />
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>
              {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? "Log in to see your family's cycles." : 'Sign up to start tracking.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {!isFirebaseConfigured && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Action Required: Connect to Firebase</AlertTitle>
                  <AlertDescription>
                    The app is in <strong>demo mode</strong>. You must connect it to your Firebase project to save any data.
                    Please follow the step-by-step guide in the `README.md` file.
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">{emailLabel}</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder={emailPlaceholder}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-card border-border"
                  autoComplete="username"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-card border-border"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={isLoading || !isFirebaseConfigured}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === 'login' ? 'Login' : 'Create Account')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => handleModeChange('signup')} className="font-semibold text-primary underline-offset-4 hover:underline" disabled={isLoading}>
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => handleModeChange('login')} className="font-semibold text-primary underline-offset-4 hover:underline" disabled={isLoading}>
                    Log in
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
