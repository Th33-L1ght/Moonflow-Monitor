'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
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


export function Header() {
  const { user, signOut } = useAuth();
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const canEditProfile = user?.role === 'parent';

  return (
    <>
      <header className="flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Logo />
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || "https://placehold.co/100x100.png"} alt="User avatar" data-ai-hint="person avatar"/>
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canEditProfile && (
              <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      {canEditProfile && (
        <EditParentProfileDialog isOpen={isProfileDialogOpen} setOpen={setProfileDialogOpen} />
      )}
    </>
  );
}
