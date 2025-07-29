'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, TrendingUp, DollarSign, Users } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    organization_legal_name: string
}

interface Card {
    id: string
    name: string
    status: 'issued' | 'frozen' | 'cancelled'
    balance: number
    cardholder_name: string
    budget_ids: string[]
    created_at: string
}

interface Budget {
    id: string
    name: string
    limit_amount: number
    period: string
    require_receipts: boolean
}

interface CardBalance {
    card_id: string
    card_name: string
    total_spent: number
    total_limit: number
    remaining_amount: number
    budget_balances: {
        budget_id: string
        budget_name: string
        limit_amount: number
        spent_amount: number
        remaining_amount: number
        period: string
    }[]
}

interface BalanceResponse {
    card_balances: CardBalance[]
    total_spent: number
    total_limit: number
    total_remaining: number
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [cards, setCards] = useState<Card[]>([])
    const [balances, setBalances] = useState<BalanceResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedCard, setSelectedCard] = useState<CardBalance | null>(null)
    const [showPieChart, setShowPieChart] = useState(false)

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

                // Fetch dashboard data
                await fetchDashboardData()

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

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            // Fetch cards and balances in parallel
            const [cardsResponse, balancesResponse] = await Promise.all([
                fetch(`${apiUrl}/api/cards`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${apiUrl}/api/balances`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            if (cardsResponse.ok) {
                const cardsData = await cardsResponse.json()
                setCards(cardsData)
            }

            if (balancesResponse.ok) {
                const balancesData = await balancesResponse.json()
                setBalances(balancesData)
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const getBalancePercentage = (spent: number, limit: number) => {
        if (limit === 0) return 0
        return Math.min((spent / limit) * 100, 100)
    }

    const getProgressBarColor = (percentage: number) => {
        if (percentage > 90) return 'bg-red-500'
        if (percentage > 75) return 'bg-yellow-500'
        return 'bg-blue-500'
    }

    const handleCardClick = (cardBalance: CardBalance) => {
        setSelectedCard(cardBalance)
        setShowPieChart(true)
    }

    const closePieChart = () => {
        setShowPieChart(false)
        setSelectedCard(null)
    }

    const getPieChartData = (cardBalance: CardBalance) => {
        const totalSpent = cardBalance.total_spent
        const totalLimit = cardBalance.total_limit

        // Create budget segments
        const budgetSegments = cardBalance.budget_balances.map((budget, index) => {
            const percentage = totalLimit > 0 ? (budget.spent_amount / totalLimit) * 100 : 0
            return {
                name: budget.budget_name,
                amount: budget.spent_amount,
                percentage: percentage,
                color: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'][index % 5]
            }
        })

        // Add remaining segment if there's unused budget
        const totalUsed = budgetSegments.reduce((sum, segment) => sum + segment.amount, 0)
        const remaining = totalLimit - totalUsed
        if (remaining > 0) {
            budgetSegments.push({
                name: 'Remaining',
                amount: remaining,
                percentage: (remaining / totalLimit) * 100,
                color: '#E5E7EB'
            })
        }

        return budgetSegments
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.first_name || 'User'}
                        </h1>
                        <p className="text-gray-600 mt-1">Here's what's happening with your account</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => router.push('/transactions')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Manage Payments
                        </button>
                        <button
                            onClick={() => router.push('/cards')}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Issue Card
                        </button>
                    </div>
                </div>

                {/* Account Balances Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Balances</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {balances?.card_balances.map((cardBalance) => {
                            const percentage = getBalancePercentage(cardBalance.total_spent, cardBalance.total_limit)
                            return (
                                <div
                                    key={cardBalance.card_id}
                                    onClick={() => handleCardClick(cardBalance)}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{cardBalance.card_name}</h3>
                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(cardBalance.total_spent)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                of {formatCurrency(cardBalance.total_limit)}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className={`font-medium ${cardBalance.remaining_amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {formatCurrency(cardBalance.remaining_amount)} available
                                            </span>
                                            <span className="text-gray-500">
                                                {percentage.toFixed(1)}% used
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Cards Summary Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{cards.length}</h3>
                                <p className="text-sm text-gray-500">cards active</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/cards')}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <span>View all cards</span>
                            <TrendingUp className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Pie Chart Modal */}
            {showPieChart && selectedCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {selectedCard.card_name} - Budget Breakdown
                            </h2>
                            <button
                                onClick={closePieChart}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Total:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(selectedCard.total_spent)} / {formatCurrency(selectedCard.total_limit)}
                                    </span>
                                </div>
                            </div>

                            {/* Pie Chart */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-48 h-48">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        {(() => {
                                            const pieData = getPieChartData(selectedCard)
                                            let currentAngle = 0

                                            return pieData.map((segment, index) => {
                                                const angle = (segment.percentage / 100) * 360
                                                const x1 = 50 + 40 * Math.cos(currentAngle * Math.PI / 180)
                                                const y1 = 50 + 40 * Math.sin(currentAngle * Math.PI / 180)
                                                const x2 = 50 + 40 * Math.cos((currentAngle + angle) * Math.PI / 180)
                                                const y2 = 50 + 40 * Math.sin((currentAngle + angle) * Math.PI / 180)

                                                const largeArcFlag = angle > 180 ? 1 : 0

                                                const pathData = [
                                                    `M 50 50`,
                                                    `L ${x1} ${y1}`,
                                                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                    'Z'
                                                ].join(' ')

                                                currentAngle += angle

                                                return (
                                                    <path
                                                        key={index}
                                                        d={pathData}
                                                        fill={segment.color}
                                                        stroke="white"
                                                        strokeWidth="1"
                                                    />
                                                )
                                            })
                                        })()}
                                    </svg>
                                </div>
                            </div>

                            {/* Budget Breakdown Table */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Budget Breakdown</h4>
                                <div className="space-y-2">
                                    {getPieChartData(selectedCard).map((segment, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: segment.color }}
                                                ></div>
                                                <span className="text-gray-700">{segment.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-gray-600">{formatCurrency(segment.amount)}</span>
                                                <span className="text-green-600 font-medium">
                                                    {segment.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
} 