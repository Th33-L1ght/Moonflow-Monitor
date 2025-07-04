
'use client';

import { LogOut, User as UserIcon, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Logo } from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { EditParentProfileDialog } from './EditParentProfileDialog';
import { FeedbackDialog } from './FeedbackDialog';
import { AddChildDialog } from './AddChildDialog';


export interface HeaderProps {
    onChildAdded?: () => void;
}

export function Header({ onChildAdded }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [isAddChildDialogOpen, setAddChildDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const canEditProfile = user?.role === 'parent';
  const handleChildAdded = onChildAdded || (() => {});

  return (
    <>
      <header className="flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.photoURL ?? undefined} alt="User avatar" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canEditProfile && (
              <>
                <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setAddChildDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add Child Profile</span>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onSelect={() => setFeedbackDialogOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Feedback</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      {canEditProfile && (
        <>
          <EditParentProfileDialog isOpen={isProfileDialogOpen} setOpen={setProfileDialogOpen} />
          <AddChildDialog isOpen={isAddChildDialogOpen} setOpen={setAddChildDialogOpen} onChildAdded={handleChildAdded} />
        </>
      )}
      <FeedbackDialog isOpen={isFeedbackDialogOpen} setOpen={setFeedbackDialogOpen} />
    </>
  );
}
