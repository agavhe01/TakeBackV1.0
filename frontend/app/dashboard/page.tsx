'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, TrendingUp, DollarSign, Users, Calendar, Clock } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { API_URLS, api } from '../../config'
import React from 'react'

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

interface SpendingAnalytics {
    budget_id: string
    budget_name: string
    total_spent: number
    percentage: number
    color: string
}

interface RecentTransaction {
    id: string
    name: string
    amount: number
    date: string
    card_name: string
    budget_name: string
    category?: string
    merchant?: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [cards, setCards] = useState<Card[]>([])
    const [balances, setBalances] = useState<BalanceResponse | null>(null)
    const [spendingAnalytics, setSpendingAnalytics] = useState<SpendingAnalytics[]>([])
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('month')
    const [modalTimePeriod, setModalTimePeriod] = useState('month')
    const [modalCardData, setModalCardData] = useState<CardBalance | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedCard, setSelectedCard] = useState<CardBalance | null>(null)
    const [showPieChart, setShowPieChart] = useState(false)
    const [showWelcome, setShowWelcome] = useState(false)

    // Add loading states for individual sections
    const [cardsLoading, setCardsLoading] = useState(true)
    const [balancesLoading, setBalancesLoading] = useState(true)
    const [analyticsLoading, setAnalyticsLoading] = useState(true)
    const [transactionsLoading, setTransactionsLoading] = useState(true)





    useEffect(() => {
        console.log('=== DASHBOARD PAGE LOADED ===')
        console.log('Checking authentication status...')

        const checkAuth = async () => {
            const token = localStorage.getItem('access_token')
            const userData = localStorage.getItem('user')

            console.log('Token exists:', !!token)
            console.log('User data exists:', !!userData)

            if (!token || !userData) {
                console.log('No token or user data found, redirecting to signin')
                router.push('/signin')
                return
            }

            try {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser)
                console.log('User data set:', parsedUser)

                // Start loading data immediately after user is set
                await fetchDashboardData()
            } catch (error) {
                console.error('Error parsing user data:', error)
                router.push('/signin')
            }
        }

        checkAuth()
    }, [router])

    useEffect(() => {
        // Show welcome popup only if not shown in this session
        const hasSeenWelcome = localStorage.getItem('takeback_welcome_shown')
        if (!hasSeenWelcome) {
            setShowWelcome(true)
            localStorage.setItem('takeback_welcome_shown', 'true')
        }
    }, [])

    // Simple time period change handler
    useEffect(() => {
        if (user && selectedTimePeriod) {
            // Refetch period-dependent data when time period changes
            setBalancesLoading(true)
            setAnalyticsLoading(true)

            Promise.all([
                api.get(`${API_URLS.ANALYTICS_BALANCES}?period=${selectedTimePeriod}`)
                    .then(response => response.json())
                    .then(data => {
                        setBalances(data)
                        setBalancesLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching balances:', error)
                        setBalancesLoading(false)
                    }),
                api.get(`${API_URLS.ANALYTICS_SPENDING}?period=${selectedTimePeriod}`)
                    .then(response => response.json())
                    .then(data => {
                        setSpendingAnalytics(data)
                        setAnalyticsLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching analytics:', error)
                        setAnalyticsLoading(false)
                    })
            ])
        }
    }, [selectedTimePeriod, user])

    const fetchDashboardData = useCallback(async () => {
        try {
            console.log('Fetching dashboard data...')

            // Always fetch fresh data on initial load (ignore cache for now)
            const promises = [
                api.get(API_URLS.CARDS)
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to fetch cards')
                        return response.json()
                    })
                    .then(data => {
                        console.log('Cards loaded:', data)
                        setCards(data)
                        setCardsLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching cards:', error)
                        setCardsLoading(false)
                    }),

                api.get(`${API_URLS.ANALYTICS_BALANCES}?period=${selectedTimePeriod}`)
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to fetch balances')
                        return response.json()
                    })
                    .then(data => {
                        console.log('Balances loaded:', data)
                        setBalances(data)
                        setBalancesLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching balances:', error)
                        setBalancesLoading(false)
                    }),

                api.get(`${API_URLS.ANALYTICS_SPENDING}?period=${selectedTimePeriod}`)
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to fetch analytics')
                        return response.json()
                    })
                    .then(data => {
                        console.log('Analytics loaded:', data)
                        setSpendingAnalytics(data)
                        setAnalyticsLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching analytics:', error)
                        setAnalyticsLoading(false)
                    }),

                api.get(`${API_URLS.ANALYTICS_RECENT_TRANSACTIONS}?limit=10`)
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to fetch transactions')
                        return response.json()
                    })
                    .then(data => {
                        console.log('Transactions loaded:', data)
                        setRecentTransactions(data)
                        setTransactionsLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching transactions:', error)
                        setTransactionsLoading(false)
                    })
            ]

            // Wait for all promises to complete
            await Promise.all(promises)

            console.log('All data loaded, setting isLoading to false')
            setIsLoading(false)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setIsLoading(false)
        }
    }, [selectedTimePeriod])



    const fetchCardBalance = async (cardId: string, period: string) => {
        try {
            const response = await api.get(`${API_URLS.CARDS}/${cardId}/balance?period=${period}`)

            if (response.ok) {
                const data = await response.json()
                return data
            }
        } catch (error) {
            console.error('Error fetching card balance:', error)
        }
    }

    const handleModalTimePeriodChange = (newPeriod: string) => {
        setModalTimePeriod(newPeriod)
        if (selectedCard) {
            fetchCardBalance(selectedCard.card_id, newPeriod)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
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
        setModalTimePeriod('month') // Reset to default when opening
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

    const getTimePeriodLabel = (period: string) => {
        switch (period) {
            case 'week': return 'This Week'
            case 'month': return 'This Month'
            case 'quarter': return 'This Quarter'
            case 'year': return 'This Year'
            default: return 'This Month'
        }
    }

    // Skeleton loading components
    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
    )

    const SkeletonTable = () => (
        <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="p-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        </div>
    )

    const SkeletonChart = () => (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                ))}
            </div>
        </div>
    )

    // Memoized calculations
    const totalSpent = useMemo(() => {
        return balances?.total_spent || 0
    }, [balances?.total_spent])

    const totalLimit = useMemo(() => {
        return balances?.total_limit || 0
    }, [balances?.total_limit])

    const totalRemaining = useMemo(() => {
        return balances?.total_remaining || 0
    }, [balances?.total_remaining])

    const activeCardsCount = useMemo(() => {
        return cards.filter(card => card.status === 'issued').length
    }, [cards])

    const frozenCardsCount = useMemo(() => {
        return cards.filter(card => card.status === 'frozen').length
    }, [cards])

    if (isLoading) {
        console.log('Dashboard is loading...')
        return (
            <DashboardLayout>
                <div className="p-8 space-y-8">
                    {/* Welcome Section Skeleton */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="flex space-x-3">
                            <div className="h-10 bg-gray-200 rounded w-32"></div>
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>

                    {/* Charts and Tables Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <SkeletonChart />
                        <SkeletonTable />
                    </div>
                </div>
            </DashboardLayout>
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

    console.log('Dashboard loaded, rendering content...')
    return (
        <DashboardLayout>
            {/* Welcome Popup */}
            {showWelcome && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold mb-4 text-center">Welcome to TakeBack!</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-base mb-6">
                            <li><b>Create budgets</b> first to set your spending limits.</li>
                            <li><b>Create cards</b> and assign one or more budgets to each card.</li>
                            <li><b>Upload receipts</b> for your purchases.</li>
                            <li><b>Add transactions</b> and optionally link them to receipts.</li>
                            <li>Check the <b>Dashboard</b> for analytics and visual insights.</li>
                        </ul>
                        <button
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                            onClick={() => setShowWelcome(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
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

                {/* Top Spending Budgets Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Spending Analytics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Top Spending Budgets</h3>
                                    <p className="text-sm text-gray-500">Spending distribution by budget</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedTimePeriod}
                                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                        </div>

                        {analyticsLoading ? (
                            <div className="space-y-4">
                                <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                            <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : spendingAnalytics.length > 0 ? (
                            <div className="space-y-4">
                                {/* Pie Chart */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative w-48 h-48">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            {(() => {
                                                let currentAngle = 0
                                                return spendingAnalytics.map((item, index) => {
                                                    const angle = (item.percentage / 100) * 360
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
                                                            fill={item.color}
                                                            stroke="white"
                                                            strokeWidth="1"
                                                        />
                                                    )
                                                })
                                            })()}
                                        </svg>
                                    </div>
                                </div>

                                {/* Budget Breakdown */}
                                <div className="space-y-2">
                                    {spendingAnalytics.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                                <span className="text-gray-700">{item.budget_name}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-gray-600">{formatCurrency(item.total_spent)}</span>
                                                <span className="text-green-600 font-medium">
                                                    {item.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No spending data</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No transactions found for {getTimePeriodLabel(selectedTimePeriod).toLowerCase()}.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Clock className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                                    <p className="text-sm text-gray-500">Latest spending activity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/transactions')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </button>
                        </div>

                        {transactionsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {recentTransactions.slice(0, 3).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{transaction.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {transaction.card_name} • {transaction.budget_name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(transaction.amount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(transaction.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            {transaction.category && (
                                                <div className="mt-1">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {transaction.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent transactions</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No transactions found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Balances Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Balances</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {balancesLoading ? (
                            // Show skeleton cards while loading
                            [1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : balances?.card_balances.map((cardBalance) => {
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
                                {cardsLoading ? (
                                    <>
                                        <div className="h-6 bg-gray-200 rounded w-8 mb-1 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-semibold text-gray-900">{cards.length}</h3>
                                        <p className="text-sm text-gray-500">cards active</p>
                                    </>
                                )}
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
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {getTimePeriodLabel(modalTimePeriod)}
                                    </h3>
                                    <select
                                        value={modalTimePeriod}
                                        onChange={(e) => handleModalTimePeriodChange(e.target.value)}
                                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                    >
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
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