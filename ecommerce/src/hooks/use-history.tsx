import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const RouteHistoryContext = createContext<string[]>([]);

export const RouteHistoryProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        setHistory((prev) => [...prev, pathname]);
    }, [pathname]);

    return (
        <RouteHistoryContext.Provider value={history}>
            {children}
        </RouteHistoryContext.Provider>
    );
};

export const useRouteHistory = () => useContext(RouteHistoryContext);
