'use client'

import { useState, useEffect } from 'react'
import { Plus, CreditCard, Filter, ChevronDown, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import CardModal from '../../components/CardModal'

interface Budget {
    id: string
    name: string
    limit_amount: number
    period: 'monthly' | 'weekly' | 'quarterly'
    require_receipts: boolean
    created_at: string
}

interface Card {
    id: string
    name: string
    status: 'issued' | 'frozen' | 'cancelled'
    balance: number
    cardholder_name: string
    cvv: string
    expiry: string
    zipcode: string
    address: string
    budget_ids: string[]
    created_at: string
}

interface BudgetBalance {
    budget_id: string
    budget_name: string
    limit_amount: number
    spent_amount: number
    remaining_amount: number
    period: string
}

interface CardBalance {
    card_id: string
    card_name: string
    total_spent: number
    total_limit: number
    remaining_amount: number
    budget_balances: BudgetBalance[]
}

interface BalanceResponse {
    card_balances: CardBalance[]
    total_spent: number
    total_limit: number
    total_remaining: number
}

export default function CardsPage() {
    const [cards, setCards] = useState<Card[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [balances, setBalances] = useState<BalanceResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'all' | 'issued' | 'frozen' | 'cancelled'>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCard, setSelectedCard] = useState<Card | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [expandedBalances, setExpandedBalances] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchCards()
        fetchBudgets()
        fetchBalances()
    }, [])

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/cards`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCards(data)
            } else {
                console.error('Failed to fetch cards')
            }
        } catch (error) {
            console.error('Error fetching cards:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchBudgets = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/budgets`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setBudgets(data)
            } else {
                console.error('Failed to fetch budgets')
            }
        } catch (error) {
            console.error('Error fetching budgets:', error)
        }
    }

    const fetchBalances = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/analytics/balances`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setBalances(data)
            } else {
                console.error('Failed to fetch balances')
            }
        } catch (error) {
            console.error('Error fetching balances:', error)
        }
    }

    const handleCreateCard = () => {
        setSelectedCard(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEditCard = (card: Card) => {
        setSelectedCard(card)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleSaveCard = async (cardData: Partial<Card>) => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            if (modalMode === 'create') {
                // Create new card
                const response = await fetch(`${apiUrl}/api/cards`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(cardData)
                })

                if (response.ok) {
                    await fetchCards() // Refresh the cards list
                } else {
                    throw new Error('Failed to create card')
                }
            } else {
                // Update existing card
                const response = await fetch(`${apiUrl}/api/cards/${selectedCard?.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(cardData)
                })

                if (response.ok) {
                    await fetchCards() // Refresh the cards list
                } else {
                    throw new Error('Failed to update card')
                }
            }
        } catch (error) {
            console.error('Error saving card:', error)
            throw error
        }
    }

    const handleDeleteCard = async (cardId: string) => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/cards/${cardId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                await fetchCards() // Refresh the cards list
            } else {
                throw new Error('Failed to delete card')
            }
        } catch (error) {
            console.error('Error deleting card:', error)
            throw error
        }
    }

    const filteredCards = activeTab === 'all'
        ? cards
        : cards.filter(card => card.status === activeTab)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'issued':
                return 'bg-green-100 text-green-800'
            case 'frozen':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const getCardBudgets = (card: Card) => {
        return budgets.filter(budget => card.budget_ids.includes(budget.id))
    }

    const getTotalBudgetAmount = (card: Card) => {
        return getCardBudgets(card).reduce((total, budget) => total + budget.limit_amount, 0)
    }

    const getCardholderInitials = (name: string) => {
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
    }

    const getCardBalance = (cardId: string) => {
        if (!balances) return null
        return balances.card_balances.find(balance => balance.card_id === cardId)
    }

    const toggleBalanceExpansion = (cardId: string) => {
        const newExpanded = new Set(expandedBalances)
        if (newExpanded.has(cardId)) {
            newExpanded.delete(cardId)
        } else {
            newExpanded.add(cardId)
        }
        setExpandedBalances(newExpanded)
    }

    const getBudgetDisplayName = (card: Card) => {
        const cardBudgets = getCardBudgets(card)
        if (cardBudgets.length === 0) return 'No budgets assigned'
        if (cardBudgets.length === 1) return cardBudgets[0].name
        return `${cardBudgets.length} budgets`
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
                    <button
                        onClick={handleCreateCard}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Card</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                        {(['all', 'issued', 'frozen', 'cancelled'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cardholder
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Budget
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCards.map((card) => (
                                    <tr key={card.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditCard(card)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {card.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ...{card.id.slice(-4)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {(() => {
                                                    const cardBalance = getCardBalance(card.id)
                                                    if (cardBalance) {
                                                        return (
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span>{formatCurrency(cardBalance.total_spent)} / {formatCurrency(cardBalance.total_limit)}</span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            toggleBalanceExpansion(card.id)
                                                                        }}
                                                                        className="text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        {expandedBalances.has(card.id) ? (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {cardBalance.remaining_amount >= 0 ? (
                                                                        <span className="text-green-600">
                                                                            ${cardBalance.remaining_amount.toFixed(2)} remaining
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-red-600">
                                                                            ${Math.abs(cardBalance.remaining_amount).toFixed(2)} over limit
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {expandedBalances.has(card.id) && (
                                                                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                                                                        <div className="text-xs font-medium text-gray-700 mb-1">Budget Breakdown:</div>
                                                                        {cardBalance.budget_balances.map((budgetBalance) => (
                                                                            <div key={budgetBalance.budget_id} className="flex justify-between items-center text-xs py-1">
                                                                                <span className="text-gray-600">{budgetBalance.budget_name}</span>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span>{formatCurrency(budgetBalance.spent_amount)} / {formatCurrency(budgetBalance.limit_amount)}</span>
                                                                                    <span className={`text-xs ${budgetBalance.remaining_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                        {budgetBalance.remaining_amount >= 0 ? '+' : ''}{formatCurrency(budgetBalance.remaining_amount)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    } else {
                                                        return (
                                                            <div>
                                                                <div className="text-sm text-gray-900">
                                                                    {formatCurrency(card.balance)} / {formatCurrency(getTotalBudgetAmount(card))}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {getCardBudgets(card).length > 0 ? `${getCardBudgets(card).length} budget${getCardBudgets(card).length > 1 ? 's' : ''}` : 'No budgets'}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-medium">
                                                        {getCardholderInitials(card.cardholder_name)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {card.cardholder_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {card.cardholder_name.toLowerCase().replace(' ', '.')}@givefront.com
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {getBudgetDisplayName(card)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                                                {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCards.length === 0 && (
                        <div className="text-center py-12">
                            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No cards</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new card.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleCreateCard}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                                    Add Card
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Rows per page</span>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                            <option>25</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Page 1 of 1</span>
                        <button className="text-gray-400 hover:text-gray-600">
                            «
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                            ‹
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                            ›
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                            »
                        </button>
                    </div>
                </div>
            </div>

            {/* Card Modal */}
            <CardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                card={selectedCard}
                onSave={handleSaveCard}
                onDelete={handleDeleteCard}
                mode={modalMode}
            />
        </DashboardLayout>
    )
} 