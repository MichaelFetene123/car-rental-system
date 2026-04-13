'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface TanstackProviderProps {
    children: React.ReactNode;
}

export function TanstackProvider({ children }: TanstackProviderProps) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}