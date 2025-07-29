'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2 } from 'lucide-react'

interface Card {
    id: string
    name: string
    cardholder_name: string
    budget_ids: string[]
}

interface Budget {
    id: string
    name: string
    limit_amount: number
    period: string
}

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

interface TransactionModalProps {
    isOpen: boolean
    onClose: () => void
    transaction?: Transaction | null
    onSave: (transactionData: Partial<Transaction>) => Promise<void>
    onDelete?: (transactionId: string) => Promise<void>
    mode: 'create' | 'edit'
}

export default function TransactionModal({ isOpen, onClose, transaction, onSave, onDelete, mode }: TransactionModalProps) {
    const [formData, setFormData] = useState({
        card_id: '',
        budget_id: '',
        amount: 0,
        name: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [availableCards, setAvailableCards] = useState<Card[]>([])
    const [availableBudgets, setAvailableBudgets] = useState<Budget[]>([])
    const [isLoadingData, setIsLoadingData] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchCardsAndBudgets()
        }
    }, [isOpen])

    useEffect(() => {
        if (transaction && mode === 'edit') {
            setFormData({
                card_id: transaction.card_id || '',
                budget_id: transaction.budget_id || '',
                amount: transaction.amount,
                name: transaction.name,
                date: transaction.date.split('T')[0],
                description: transaction.description || '',
                category: transaction.category || ''
            })
        } else if (mode === 'create') {
            setFormData({
                card_id: '',
                budget_id: '',
                amount: 0,
                name: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                category: ''
            })
        }
    }, [transaction, mode])

    const fetchCardsAndBudgets = async () => {
        setIsLoadingData(true)
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const [cardsResponse, budgetsResponse] = await Promise.all([
                fetch(`${apiUrl}/api/cards`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${apiUrl}/api/budgets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            if (cardsResponse.ok && budgetsResponse.ok) {
                const cards: Card[] = await cardsResponse.json()
                const budgets: Budget[] = await budgetsResponse.json()
                setAvailableCards(cards)
                setAvailableBudgets(budgets)
            } else {
                console.error('Failed to fetch cards or budgets')
            }
        } catch (error) {
            console.error('Error fetching cards and budgets:', error)
        } finally {
            setIsLoadingData(false)
        }
    }

    const getAvailableBudgetsForCard = (cardId: string) => {
        const card = availableCards.find(c => c.id === cardId)
        if (!card) return []
        return availableBudgets.filter(budget => card.budget_ids.includes(budget.id))
    }

    const handleSave = async () => {
        if (!formData.card_id || !formData.budget_id || !formData.name || formData.amount <= 0) {
            alert('Please fill in all required fields')
            return
        }

        setIsLoading(true)
        try {
            // For create mode, we need to find the card_budget_id
            let card_budget_id = ''
            if (mode === 'create') {
                // Get the card_budget_id from the backend
                const token = localStorage.getItem('access_token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

                const response = await fetch(`${apiUrl}/api/card-budgets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    const cardBudgets = await response.json()
                    const cardBudget = cardBudgets.find((cb: any) =>
                        cb.card_id === formData.card_id && cb.budget_id === formData.budget_id
                    )
                    if (cardBudget) {
                        card_budget_id = cardBudget.id
                    } else {
                        throw new Error('Selected card and budget combination not found')
                    }
                } else {
                    throw new Error('Failed to get card-budget combinations')
                }
            } else {
                // For edit mode, use the existing card_budget_id
                card_budget_id = transaction!.card_budget_id
            }

            const transactionData = {
                card_budget_id,
                amount: formData.amount,
                name: formData.name,
                date: formData.date,
                description: formData.description,
                category: formData.category
            }

            await onSave(transactionData)
            onClose()
        } catch (error) {
            console.error('Error saving transaction:', error)
            alert('Error saving transaction: ' + (error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!transaction || !onDelete) return

        if (!confirm('Are you sure you want to delete this transaction?')) return

        setIsLoading(true)
        try {
            await onDelete(transaction.id)
            onClose()
        } catch (error) {
            console.error('Error deleting transaction:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Card Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card *
                        </label>
                        <select
                            value={formData.card_id}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    card_id: e.target.value,
                                    budget_id: '' // Reset budget when card changes
                                }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoadingData}
                        >
                            <option value="">Select Card</option>
                            {availableCards.map(card => (
                                <option key={card.id} value={card.id}>
                                    {card.name} - {card.cardholder_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget *
                        </label>
                        <select
                            value={formData.budget_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, budget_id: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoadingData || !formData.card_id}
                        >
                            <option value="">Select Budget</option>
                            {formData.card_id && getAvailableBudgetsForCard(formData.card_id).map(budget => (
                                <option key={budget.id} value={budget.id}>
                                    {budget.name} (${budget.limit_amount} {budget.period})
                                </option>
                            ))}
                        </select>
                        {formData.card_id && getAvailableBudgetsForCard(formData.card_id).length === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                                No budgets available for this card
                            </p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter transaction name"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Food, Travel, Office"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Enter transaction description"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    {mode === 'edit' && onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isLoading || isLoadingData}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
} 