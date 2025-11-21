"use client"

import { useState, useEffect, ReactNode } from "react"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { DEFAULT_THEME, ThemePreference } from "@/data/store/interfaces/theme";

type ColorTheme = ThemePreference["primaryColor"]
interface ThemeProviderProps {
    children: ReactNode
}

export function Theme({ children }: ThemeProviderProps) {

    const { company } = useParams<{ company: string }>();
    const { setCompanytStore } = useCompanytStore()
    const [primaryColor, setPrimaryColor] = useState<ColorTheme>(DEFAULT_THEME.primaryColor)
    const [loading, setLoading] = useState(true)

    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [error, setError] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        async function loadThemePreference() {
            try {
                setLoading(true)
                const res = await api.get(`/api/ecommerce/companies/${company}`)

                const { data } = res
                setCompanytStore(data.company)
                /*if (data.mode === null) {
                    localStorage.setItem('theme', DEFAULT_THEME.mode)
                    setTheme(DEFAULT_THEME.mode)
                    setPrimaryColor(DEFAULT_THEME.primaryColor)
                } else {
                    localStorage.setItem('theme', data.mode)
                    setTheme(data.mode)
                    setPrimaryColor(data.primaryColor)
                }*/
                console.log('data', data)
                api.defaults.headers.common['Authorization'] = `Bearer ${data.company.token}`;
                setCompanytStore(data.company)
            } catch (err: any) {
                console.log('err', err)
                setError(true)
                setLoading(false)
            } finally {
                setLoading(false)
            }
        }

        loadThemePreference()
    }, [])

    useEffect(() => {
        document.documentElement.classList.remove(
            "theme-blue",
            "theme-red",
            "theme-green",
            "theme-yellow",
            "theme-purple",
            "theme-pink",
        )
        document.documentElement.classList.add(`theme-${primaryColor}`)
    }, [primaryColor])


    if (!mounted) {
        return null
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando preferências de tema...</span>
            </div>
        )
    }

    if (error) {
        return <div className="flex h-screen flex-col items-center justify-center bg-gray-100 text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-lg text-gray-600">Página não encontrada.</p>
        </div>
    }

    return <>
        {children}
    </>
}

