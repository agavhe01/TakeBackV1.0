'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
    LayoutDashboard,
    CreditCard,
    DollarSign,
    ArrowLeftRight,
    Shield,
    Settings,
    MessageCircle,
    ChevronDown,
    Leaf,
    LogOut
} from 'lucide-react'
import PersonalSettingsModal from './PersonalSettingsModal'

interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    date_of_birth?: string
    address?: string
    zip_code?: string
    ssn?: string
    organization_legal_name: string
    orginazation_ein_number: string
    created_at: string
}

interface NavigationSidebarProps {
    user?: {
        name: string
        email: string
        initials: string
    }
}

export default function NavigationSidebar({ user }: NavigationSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isPersonalSettingsOpen, setIsPersonalSettingsOpen] = useState(false)
    const [userData, setUserData] = useState<User | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard
        },
        {
            name: 'Cards',
            href: '/cards',
            icon: CreditCard
        },
        {
            name: 'Budgets',
            href: '/budgets',
            icon: DollarSign
        },
        {
            name: 'Transactions',
            href: '/transactions',
            icon: ArrowLeftRight
        },
        {
            name: 'Policies',
            href: '/policies',
            icon: Shield
        }
    ]

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUserData(userData)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }

    const handlePersonalSettings = () => {
        fetchUserData()
        setIsPersonalSettingsOpen(true)
    }

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    const handleSignout = () => {
        console.log('=== SIGNOUT REQUESTED ===')
        console.log('Clearing local storage...')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        console.log('Redirecting to signin page...')
        router.push('/signin')
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Branding */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">TakeBack</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <li key={item.name}>
                                <button
                                    onClick={() => router.push(item.href)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                <button onClick={handlePersonalSettings} className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Personal Settings</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>Chat With Support</span>
                </button>

                {/* User Profile with Dropdown */}
                {user && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user.initials}</span>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <button
                                    onClick={handleSignout}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <PersonalSettingsModal isOpen={isPersonalSettingsOpen} onClose={() => setIsPersonalSettingsOpen(false)} user={userData} />
        </div>
    )
} 