
'use client';

import { LogOut, MessageSquare, UserPlus, Trash2, HeartHandshake, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { FeedbackDialog } from '@/components/FeedbackDialog';
import { AddChildDialog } from '@/components/AddChildDialog';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';


export interface HeaderProps {
    onProfileAdded?: () => void;
    hasParentProfile?: boolean;
    onEditMyProfile?: () => void;
}

export function Header({ onProfileAdded, hasParentProfile, onEditMyProfile }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isFeedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [isAddChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const [isCreatingParentProfile, setCreatingParentProfile] = useState(false);

  const [isDeleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleAddChild = () => {
    setCreatingParentProfile(false);
    setAddChildDialogOpen(true);
  }

  const handleAddParentProfile = () => {
    setCreatingParentProfile(true);
    setAddChildDialogOpen(true);
  }

  const canEditProfile = user?.role === 'parent';
  const handleProfileAdded = onProfileAdded || (() => {});

  return (
    <>
      <header className="flex h-20 items-center px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
        
        <div className="ml-auto pl-4">
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
                    <DropdownMenuItem onSelect={handleAddChild}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Add Child Profile</span>
                    </DropdownMenuItem>
                    {!hasParentProfile && (
                        <DropdownMenuItem onSelect={handleAddParentProfile}>
                            <HeartHandshake className="mr-2 h-4 w-4" />
                            <span>Create My Profile</span>
                        </DropdownMenuItem>
                    )}
                     {hasParentProfile && onEditMyProfile && (
                        <DropdownMenuItem onSelect={onEditMyProfile}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit My Profile</span>
                        </DropdownMenuItem>
                    )}
                </>
                )}
                <DropdownMenuItem onSelect={() => setFeedbackDialogOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {canEditProfile && (
                    <DropdownMenuItem onSelect={() => setDeleteAccountDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Account</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      {canEditProfile && (
        <>
          <AddChildDialog 
            isOpen={isAddChildDialogOpen} 
            setOpen={setAddChildDialogOpen} 
            onProfileAdded={handleProfileAdded}
            isForParent={isCreatingParentProfile}
          />
          <DeleteAccountDialog isOpen={isDeleteAccountDialogOpen} setOpen={setDeleteAccountDialogOpen} />
        </>
      )}
      <FeedbackDialog isOpen={isFeedbackDialogOpen} setOpen={setFeedbackDialogOpen} />
    </>
  );
}
