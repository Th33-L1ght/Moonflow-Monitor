'use client';

import Image from "next/image"
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
        setError("Please enter both email and password.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password);
      toast({
          title: "Account Created",
          description: "You've been successfully signed up. Please log in.",
      });
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center">
            <div className="mb-8">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold font-body text-center">Welcome Back</h1>
            <p className="text-balance text-muted-foreground text-center mt-2">
              Log in to continue your journey.
            </p>

            <form onSubmit={handleLogin} className="w-full mt-8 space-y-4">
            {error && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-card border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-card border-border"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={handleSignUp} disabled={loading}>
              Sign Up
            </Button>
            </form>
        </div>
    </div>
  )
}
