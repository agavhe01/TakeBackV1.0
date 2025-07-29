'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, ArrowLeftRight, Edit, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import TransactionModal from '../../components/TransactionModal'

interface Transaction {
    id: string
    card_budget_id: string
    amount: number
    name: string
    date: string
    description?: string
    category?: string
    card_id?: string
    budget_id?: string
}

interface Card {
    id: string
    name: string
    cardholder_name: string
}

interface Budget {
    id: string
    name: string
    limit_amount: number
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [cards, setCards] = useState<Card[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    // Filters
    const [selectedCard, setSelectedCard] = useState<string>('')
    const [selectedBudget, setSelectedBudget] = useState<string>('')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })

    useEffect(() => {
        fetchTransactions()
        fetchCards()
        fetchBudgets()
    }, [])

    // Refetch transactions when filters change
    useEffect(() => {
        fetchTransactions()
    }, [selectedCard, selectedBudget])

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            let url = `${apiUrl}/api/transactions`
            const params = new URLSearchParams()
            if (selectedCard) params.append('card_id', selectedCard)
            if (selectedBudget) params.append('budget_id', selectedBudget)
            if (params.toString()) url += `?${params.toString()}`

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTransactions(data)
            } else {
                console.error('Failed to fetch transactions')
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
            }
        } catch (error) {
            console.error('Error fetching cards:', error)
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
            }
        } catch (error) {
            console.error('Error fetching budgets:', error)
        }
    }

    const handleCreateTransaction = () => {
        setSelectedTransaction(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEditTransaction = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleSaveTransaction = async (transactionData: Partial<Transaction>) => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            if (modalMode === 'create') {
                const response = await fetch(`${apiUrl}/api/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(transactionData)
                })

                if (response.ok) {
                    await fetchTransactions()
                } else {
                    throw new Error('Failed to create transaction')
                }
            } else {
                const response = await fetch(`${apiUrl}/api/transactions/${selectedTransaction?.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(transactionData)
                })

                if (response.ok) {
                    await fetchTransactions()
                } else {
                    throw new Error('Failed to update transaction')
                }
            }
        } catch (error) {
            console.error('Error saving transaction:', error)
            throw error
        }
    }

    const handleDeleteTransaction = async (transactionId: string) => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                await fetchTransactions()
            } else {
                throw new Error('Failed to delete transaction')
            }
        } catch (error) {
            console.error('Error deleting transaction:', error)
            throw error
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

    const getCardName = (cardId?: string) => {
        const card = cards.find(c => c.id === cardId)
        return card?.name || 'Unknown Card'
    }

    const getBudgetName = (budgetId?: string) => {
        const budget = budgets.find(b => b.id === budgetId)
        return budget?.name || 'Unknown Budget'
    }

    const getTotalAmount = () => {
        return transactions.reduce((total, t) => total + t.amount, 0)
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
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                        <p className="text-gray-600 mt-1">
                            Total: {formatCurrency(getTotalAmount())} • {transactions.length} transactions
                        </p>
                    </div>
                    <button
                        onClick={handleCreateTransaction}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Transaction</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filters:</span>
                        </div>

                        <select
                            value={selectedCard}
                            onChange={(e) => {
                                setSelectedCard(e.target.value)
                                // handleFilterChange() // This is now handled by useEffect
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">All Cards</option>
                            {cards.map(card => (
                                <option key={card.id} value={card.id}>
                                    {card.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedBudget}
                            onChange={(e) => {
                                setSelectedBudget(e.target.value)
                                // handleFilterChange() // This is now handled by useEffect
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">All Budgets</option>
                            {budgets.map(budget => (
                                <option key={budget.id} value={budget.id}>
                                    {budget.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Card & Budget
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.name}
                                                </div>
                                                {transaction.description && (
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(transaction.amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div>{getCardName(transaction.card_id)}</div>
                                                <div className="text-gray-500">{getBudgetName(transaction.budget_id)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transaction.category ? (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {transaction.category}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(transaction.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditTransaction(transaction)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {transactions.length === 0 && (
                        <div className="text-center py-12">
                            <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new transaction.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleCreateTransaction}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                                    Add Transaction
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transaction Modal */}
                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    transaction={selectedTransaction}
                    onSave={handleSaveTransaction}
                    onDelete={handleDeleteTransaction}
                    mode={modalMode}
                />
            </div>
        </DashboardLayout>
    )
} 