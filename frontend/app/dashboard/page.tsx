'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Users, TrendingUp, BarChart3, LogOut, Settings, Bell } from 'lucide-react'

interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    organization_legal_name: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        console.log('=== DASHBOARD PAGE LOADED ===')
        console.log('Checking authentication status...')

        const checkAuth = async () => {
            const token = localStorage.getItem('access_token')
            const userData = localStorage.getItem('user')

            console.log('Token exists:', !!token)
            console.log('User data exists:', !!userData)

            if (!token || !userData) {
                console.log('No token or user data found, redirecting to signin...')
                router.push('/signin')
                return
            }

            try {
                console.log('Parsing user data...')
                const parsedUser = JSON.parse(userData)
                console.log('User data:', parsedUser)
                setUser(parsedUser)

                // Verify token is still valid
                console.log('Verifying token with backend...')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                console.log('Profile verification response status:', response.status)

                if (!response.ok) {
                    console.log('Token verification failed, redirecting to signin...')
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('user')
                    router.push('/signin')
                    return
                }

                console.log('Token verified successfully')

            } catch (err) {
                console.error('Error checking authentication:', err)
                setError('Authentication error')
                router.push('/signin')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const handleLogout = () => {
        console.log('=== LOGOUT REQUESTED ===')
        console.log('Clearing local storage...')
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        console.log('Redirecting to signin page...')
        router.push('/signin')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/signin')}
                        className="bg-primary-500 text-white px-4 py-2 rounded-md"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">TakeBack Dashboard</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-500">
                                <Bell className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-500">
                                <Settings className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">
                                    Welcome, {user?.first_name} {user?.last_name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.first_name}!
                    </h2>
                    <p className="text-gray-600">
                        Here's what's happening with your organization: {user?.organization_legal_name}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Cards */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CreditCard className="h-8 w-8 text-primary-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Cards</p>
                                <p className="text-2xl font-bold text-gray-900">137</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Employees */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-8 w-8 text-primary-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">26</p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Spend */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-8 w-8 text-primary-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Monthly Spend</p>
                                <p className="text-2xl font-bold text-gray-900">$45,230</p>
                            </div>
                        </div>
                    </div>

                    {/* Active Budgets */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BarChart3 className="h-8 w-8 text-primary-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Budgets</p>
                                <p className="text-2xl font-bold text-gray-900">12</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Spend by Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Spend by Card</h3>
                        <div className="flex space-x-1 h-32 items-end">
                            <div className="flex-1 bg-primary-400 rounded-t" style={{ height: '60%' }}></div>
                            <div className="flex-1 bg-primary-600 rounded-t" style={{ height: '80%' }}></div>
                            <div className="flex-1 bg-primary-400 rounded-t" style={{ height: '40%' }}></div>
                            <div className="flex-1 bg-primary-600 rounded-t" style={{ height: '90%' }}></div>
                            <div className="flex-1 bg-primary-400 rounded-t" style={{ height: '70%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                        </div>
                    </div>

                    {/* Grant Spend-down */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Spend-down</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>SVS Grant</span>
                                    <span>60%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Full Retreat</span>
                                    <span>80%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>General Admin</span>
                                    <span>70%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">New card issued to John Doe</span>
                                <span className="text-xs text-gray-400">2 hours ago</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Budget limit reached for Marketing team</span>
                                <span className="text-xs text-gray-400">4 hours ago</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Transaction flagged for review</span>
                                <span className="text-xs text-gray-400">6 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 