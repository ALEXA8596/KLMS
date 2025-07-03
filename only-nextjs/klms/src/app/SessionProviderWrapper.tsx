'use client';
import {SessionProvider} from 'next-auth/react'; // Ensure you have next-auth installed

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}