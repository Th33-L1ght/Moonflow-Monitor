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
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center space-y-6">
            <Logo />
            
            <div className="w-full bg-card p-8 rounded-lg border shadow-sm">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Log in to your parent account.
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-background"
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
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleSignUp} disabled={loading}>
                Create Parent Account
              </Button>
              </form>
            </div>
        </div>
    </div>
  )
}
