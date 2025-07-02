'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { submitFeedbackAction } from '@/lib/firebase/client-actions';
import { Label } from './ui/label';
import { logError } from '@/lib/error-logging';

interface FeedbackDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function FeedbackDialog({ isOpen, setOpen }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !feedback.trim()) return;

    setLoading(true);
    try {
      const result = await submitFeedbackAction(user.uid, feedback.trim());

      if (result.success) {
        toast({
          title: 'Feedback Sent!',
          description: 'Thank you for your valuable input.',
        });
        setOpen(false);
        setFeedback('');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send feedback. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
       logError(error, { location: 'FeedbackDialog.handleSubmit', userId: user.uid });
       toast({
          title: 'Error',
          description: 'An unexpected error occurred while submitting feedback.',
          variant: 'destructive',
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              We'd love to hear your thoughts on how we can improve the app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="feedback-textarea" className="sr-only">Feedback</Label>
            <Textarea
              id="feedback-textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think..."
              required
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !feedback.trim()}>
              {loading ? 'Sending...' : 'Send Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
