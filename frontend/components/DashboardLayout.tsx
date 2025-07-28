'use client'

import { useEffect, useState } from 'react'
import NavigationSidebar from './NavigationSidebar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [user, setUser] = useState<{
        name: string
        email: string
        initials: string
    } | null>(null)

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData)
                const firstName = parsedUser.first_name || ''
                const lastName = parsedUser.last_name || ''
                const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

                setUser({
                    name: `${firstName} ${lastName}`,
                    email: parsedUser.email || '',
                    initials
                })
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    return (
        <div className="flex h-screen bg-gray-50">
            <NavigationSidebar user={user || undefined} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
} 