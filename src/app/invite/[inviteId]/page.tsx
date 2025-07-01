'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getInviteInfo, acceptInviteInDb } from '@/app/actions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

const InvitePageSkeleton = () => (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
)

export default function InvitePage() {
    const { inviteId } = useParams<{ inviteId: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const { signUpAndSignIn } = useAuth();

    const [childName, setChildName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchInvite = async () => {
            if (inviteId) {
                const result = await getInviteInfo(inviteId);
                if ('error' in result) {
                    setError(result.error);
                } else {
                    setChildName(result.childName);
                }
                setLoading(false);
            }
        };
        fetchInvite();
    }, [inviteId]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);
        
        try {
            const userCredential = await signUpAndSignIn(email, password);
            const dbResult = await acceptInviteInDb(inviteId, userCredential.user.uid);

            if (dbResult.success) {
                 setSuccess(true);
                 toast({
                    title: "Account Created!",
                    description: "You're now being redirected.",
                });
                // AuthContext redirect will handle the rest
            } else {
                throw new Error(dbResult.error);
            }

        } catch (error: any) {
            let message = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'This email address is already in use. Please use a different email.';
            } else if (error.code === 'auth/weak-password') {
                message = 'The password is too weak. Please choose a stronger password.';
            } else if(error.message) {
                message = error.message;
            }
            setError(message);
            setFormLoading(false);
        }
    };

    if (loading) {
        return <InvitePageSkeleton />;
    }

    if (error && !formLoading) {
         return (
             <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invite Invalid</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             </div>
         );
    }
    
    if (success) {
         return (
             <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="text-center max-w-md">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h1 className="mt-4 text-2xl font-bold">Success!</h1>
                    <p className="mt-2 text-muted-foreground">Your account has been created. Redirecting you now...</p>
                </div>
             </div>
         );
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center">
                 <div className="mb-8">
                    <Logo />
                </div>
                <h1 className="text-3xl font-bold font-body text-center">Welcome, {childName}!</h1>
                <p className="text-balance text-muted-foreground text-center mt-2">
                    Create your account to start tracking your cycle.
                </p>

                <form onSubmit={handleSignUp} className="w-full mt-8 space-y-4">
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
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={formLoading}
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
                    disabled={formLoading}
                    className="bg-card border-border"
                />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={formLoading}>
                {formLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
            </div>
        </div>
    );
}
