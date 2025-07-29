'use client'

import { useState, useEffect } from 'react'
import { X, Copy, RefreshCw, CreditCard, Eye, EyeOff, Trash2 } from 'lucide-react'

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

interface CardModalProps {
    isOpen: boolean
    onClose: () => void
    card?: Card | null
    onSave: (cardData: Partial<Card>) => Promise<void>
    onDelete?: (cardId: string) => Promise<void>
    mode: 'create' | 'edit'
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

export default function CardModal({ isOpen, onClose, card, onSave, onDelete, mode }: CardModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('edit')
    const [formData, setFormData] = useState({
        name: '',
        status: 'issued' as 'issued' | 'frozen' | 'cancelled',
        cardholder_name: '',
        cvv: '',
        expiry: '',
        zipcode: '',
        address: '',
        budget_ids: [] as string[]
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false)
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false)
    const [availableBudgets, setAvailableBudgets] = useState<Budget[]>([])
    const [isLoadingBudgets, setIsLoadingBudgets] = useState(false)
    const [cardBalance, setCardBalance] = useState<CardBalance | null>(null)
    const [isLoadingBalance, setIsLoadingBalance] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchBudgets()
            if (card && mode === 'edit') {
                fetchCardBalance()
            }
        }
    }, [isOpen, card, mode])

    useEffect(() => {
        if (card && mode === 'edit') {
            setFormData({
                name: card.name,
                status: card.status,
                cardholder_name: card.cardholder_name,
                cvv: card.cvv,
                expiry: card.expiry,
                zipcode: card.zipcode,
                address: card.address,
                budget_ids: card.budget_ids || []
            })
            setActiveTab('overview') // Show overview for existing cards
        } else if (mode === 'create') {
            setFormData({
                name: '',
                status: 'issued',
                cardholder_name: '',
                cvv: '',
                expiry: '',
                zipcode: '',
                address: '',
                budget_ids: []
            })
            setActiveTab('edit') // Show edit tab for new cards
        }
    }, [card, mode])

    const fetchBudgets = async () => {
        setIsLoadingBudgets(true)
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
                setAvailableBudgets(data)
            } else {
                console.error('Failed to fetch budgets')
            }
        } catch (error) {
            console.error('Error fetching budgets:', error)
        } finally {
            setIsLoadingBudgets(false)
        }
    }

    const fetchCardBalance = async () => {
        setIsLoadingBalance(true)
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/cards/${card?.id}/balance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data: CardBalance = await response.json()
                setCardBalance(data)
            } else {
                console.error('Failed to fetch card balance')
            }
        } catch (error) {
            console.error('Error fetching card balance:', error)
        } finally {
            setIsLoadingBalance(false)
        }
    }

    const handleBudgetToggle = (budgetId: string) => {
        setFormData(prev => ({
            ...prev,
            budget_ids: prev.budget_ids.includes(budgetId)
                ? prev.budget_ids.filter(id => id !== budgetId)
                : [...prev.budget_ids, budgetId]
        }))
    }

    const calculateTotalBalance = () => {
        return availableBudgets
            .filter(budget => formData.budget_ids.includes(budget.id))
            .reduce((total, budget) => total + budget.limit_amount, 0)
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Error saving card:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!card || !onDelete) return

        setIsLoading(true)
        try {
            await onDelete(card.id)
            onClose()
        } catch (error) {
            console.error('Error deleting card:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

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

    const formatCardNumber = (cardId: string) => {
        // Format the card ID to look like a credit card number
        const cleaned = cardId.replace(/-/g, '')
        return cleaned.match(/.{1,4}/g)?.join(' ') || cardId
    }

    const getBalancePercentage = (balance: number, limit: number = 400) => {
        return Math.min((balance / limit) * 100, 100)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {mode === 'create' ? 'Create New Card' : card?.name || 'Card Details'}
                        </h2>
                        {card && (
                            <div className="flex space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Virtual
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {card && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                                    className="text-gray-400 hover:text-gray-600 px-3 py-1 rounded border border-gray-300 text-sm"
                                >
                                    Actions
                                </button>
                                {isActionsDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                        <button
                                            onClick={handleDelete}
                                            disabled={isLoading}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>Delete Card</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs - Only show if card exists */}
                {card && (
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'edit'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {activeTab === 'overview' && card ? (
                        <div className="space-y-6">
                            {/* Card Display */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Personal Card</h3>
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg relative">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-lg font-semibold mb-1">{card.name}</h4>
                                            <p className="text-blue-200 text-sm">Virtual Card</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-blue-200">Balance</p>
                                            <p className="text-xl font-bold">${card.balance?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-blue-200 text-sm">Card Number</p>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                                                    className="text-blue-200 hover:text-white transition-colors"
                                                >
                                                    {showSensitiveInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(card.id)}
                                                    className="text-blue-200 hover:text-white transition-colors"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xl font-mono tracking-wider">
                                            {showSensitiveInfo ? formatCardNumber(card.id) : '•••• •••• •••• ••••'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="text-blue-200 text-sm">Cardholder</p>
                                                <button
                                                    onClick={() => copyToClipboard(card.cardholder_name)}
                                                    className="text-blue-200 hover:text-white transition-colors"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm">{card.cardholder_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end space-x-2 mb-1">
                                                <p className="text-blue-200 text-sm">Expires</p>
                                                <button
                                                    onClick={() => copyToClipboard(card.expiry)}
                                                    className="text-blue-200 hover:text-white transition-colors"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm">{card.expiry}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="text-blue-200 text-sm">CVV</p>
                                                <button
                                                    onClick={() => copyToClipboard(card.cvv)}
                                                    className="text-blue-200 hover:text-white transition-colors"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm">
                                                {showSensitiveInfo ? card.cvv : '•••'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end space-x-2 mb-1">
                                                <p className="text-blue-200 text-sm">ZIP Code</p>
                                                <button
                                                    onClick={() => copyToClipboard(card.zipcode)}
                                                    className="text-blue-200 hover:text-white transition-colors"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm">{card.zipcode}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <p className="text-blue-200 text-sm">Billing Address</p>
                                            <button
                                                onClick={() => copyToClipboard(card.address)}
                                                className="text-blue-200 hover:text-white transition-colors"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <p className="font-semibold text-sm">{card.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Balance */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Balance</h3>
                                {isLoadingBalance ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-2">Loading balance...</p>
                                    </div>
                                ) : cardBalance ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(cardBalance.total_spent)} / {formatCurrency(cardBalance.total_limit)}
                                            </span>
                                            <span className="text-sm text-gray-500">Total Budget</span>
                                        </div>

                                        {/* Total Balance Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-300 ${cardBalance.remaining_amount < 0 ? 'bg-red-500' : 'bg-blue-600'
                                                    }`}
                                                style={{ width: `${Math.min((cardBalance.total_spent / cardBalance.total_limit) * 100, 100)}%` }}
                                            ></div>
                                        </div>

                                        {/* Remaining Amount Indicator */}
                                        <div className="text-center">
                                            <span className={`text-lg font-semibold ${cardBalance.remaining_amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {cardBalance.remaining_amount >= 0 ? '+' : ''}{formatCurrency(cardBalance.remaining_amount)} remaining
                                            </span>
                                        </div>

                                        {/* Budget Breakdown with Visual Indicators */}
                                        {cardBalance.budget_balances.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-3">Budget Breakdown</h4>
                                                <div className="space-y-3">
                                                    {cardBalance.budget_balances.map((budgetBalance) => {
                                                        const percentageUsed = (budgetBalance.spent_amount / budgetBalance.limit_amount) * 100;

                                                        return (
                                                            <div key={budgetBalance.budget_id} className="border border-gray-200 rounded-lg p-3">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-sm font-medium text-gray-900">{budgetBalance.budget_name}</span>
                                                                    <span className="text-sm text-gray-600">
                                                                        {formatCurrency(budgetBalance.spent_amount)} / {formatCurrency(budgetBalance.limit_amount)}
                                                                    </span>
                                                                </div>

                                                                {/* Individual Budget Progress Bar */}
                                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                                    <div
                                                                        className={`h-2 rounded-full transition-all duration-300 ${percentageUsed > 90 ? 'bg-red-500' :
                                                                                percentageUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                                            }`}
                                                                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                                                    ></div>
                                                                </div>

                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className={`font-medium ${budgetBalance.remaining_amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                                        }`}>
                                                                        {budgetBalance.remaining_amount >= 0 ? '+' : ''}{formatCurrency(budgetBalance.remaining_amount)} remaining
                                                                    </span>
                                                                    <span className="text-gray-500">{budgetBalance.period}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No balance information available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter card name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="issued">Issued</option>
                                        <option value="frozen">Frozen</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cardholder Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.cardholder_name}
                                    onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter cardholder name"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVV *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cvv}
                                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="123"
                                        maxLength={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.expiry}
                                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zipcode}
                                        onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="12345"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Address *
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter billing address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Budget
                                </label>
                                <div className="space-y-2">
                                    {isLoadingBudgets ? (
                                        <div className="text-center py-2">Loading budgets...</div>
                                    ) : availableBudgets.length === 0 ? (
                                        <div className="text-center py-2">No budgets available.</div>
                                    ) : (
                                        availableBudgets.map(budget => (
                                            <div key={budget.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`budget-${budget.id}`}
                                                    checked={formData.budget_ids.includes(budget.id)}
                                                    onChange={() => handleBudgetToggle(budget.id)}
                                                    className="rounded"
                                                />
                                                <label htmlFor={`budget-${budget.id}`} className="text-sm text-gray-700">
                                                    {budget.name} - {formatCurrency(budget.limit_amount)}
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'edit' && (
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
} 