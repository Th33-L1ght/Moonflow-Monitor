import type { User as FirebaseUser } from 'firebase/auth';
import type { Child } from './types';

export interface AppUser extends FirebaseUser {
    role: 'parent' | 'child';
    childProfile?: Child;
}
