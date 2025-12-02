import { create } from 'zustand';
import { UserRole } from '@prisma/client';

interface User {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    organization?: any;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
    logout: () => set({ user: null }),
}));
