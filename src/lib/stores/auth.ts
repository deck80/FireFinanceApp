import { writable } from 'svelte/store';
import type { UserProfile } from '$lib/types';
import { browser } from '$app/environment';

interface User extends UserProfile {
    id: string;
    email: string;
    theme: 'dark' | 'light';
}

const defaultUser: User = {
    id: '1',
    email: 'fausto@example.com',
    name: 'User',
    preferredCurrency: 'EUR',
    showMaterialValues: false,
    theme: 'dark'
};

function createAuthStore() {
    const storedUser = browser ? localStorage.getItem('user') : null;
    const initialUser = storedUser ? JSON.parse(storedUser) : defaultUser;

    const { subscribe, set, update } = writable<User | null>(initialUser);

    subscribe(currentUser => {
        if (browser && currentUser) {
            localStorage.setItem('user', JSON.stringify(currentUser));
        } else if (browser && currentUser === null) {
            localStorage.removeItem('user');
        }
    });

    return {
        subscribe,
        login: (email: string) => {
            const newUser = { ...defaultUser, email, name: email.split('@')[0] };
            set(newUser);
        },
        logout: () => {
            set(null);
        },
        updateCurrency: (currency: 'EUR' | 'USD') => update(u => {
            if (!u) return null;
            return { ...u, preferredCurrency: currency };
        }),
        toggleMaterialValues: () => update(u => {
            if (!u) return null;
            return { ...u, showMaterialValues: !u.showMaterialValues };
        }),
        toggleTheme: () => update(u => {
            if (!u) return null;
            return { ...u, theme: u.theme === 'dark' ? 'light' : 'dark' };
        })
    };
}

export const auth = createAuthStore();
