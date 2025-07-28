'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../components/DashboardLayout'

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
        <DashboardLayout>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Dashboard content will go here.</p>
            </div>
        </DashboardLayout>
    )
} 