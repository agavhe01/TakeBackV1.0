'use client'

import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
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
    const [isMobileOpen, setIsMobileOpen] = useState(false)

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

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen)
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 bg-white rounded-md shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    <Menu className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Navigation Sidebar */}
            <NavigationSidebar
                user={user || undefined}
                isMobileOpen={isMobileOpen}
                onMobileToggle={toggleMobileMenu}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto lg:ml-0">
                {/* Mobile Header Spacer */}
                <div className="lg:hidden h-16"></div>
                {children}
            </main>
        </div>
    )
} 