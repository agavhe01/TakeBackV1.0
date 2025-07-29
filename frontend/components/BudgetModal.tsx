'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, DollarSign, Calendar, Receipt } from 'lucide-react'

interface Budget {
    id: string
    account_id: string
    name: string
    limit_amount: number
    period: 'monthly' | 'weekly' | 'quarterly'
    require_receipts: boolean
    created_at: string
}

interface BudgetModalProps {
    isOpen: boolean
    onClose: () => void
    budget?: Budget | null
    onSave: (budgetData: Partial<Budget>) => Promise<void>
    onDelete?: (budgetId: string) => Promise<void>
    mode: 'create' | 'edit'
}

export default function BudgetModal({ isOpen, onClose, budget, onSave, onDelete, mode }: BudgetModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('edit')
    const [formData, setFormData] = useState({
        name: '',
        limit_amount: '' as string | number,
        period: 'monthly' as 'monthly' | 'weekly' | 'quarterly',
        require_receipts: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false)

    useEffect(() => {
        if (budget && mode === 'edit') {
            setFormData({
                name: budget.name,
                limit_amount: budget.limit_amount,
                period: budget.period,
                require_receipts: budget.require_receipts
            })
            setActiveTab('overview') // Show overview for existing budgets
        } else if (mode === 'create') {
            setFormData({
                name: '',
                limit_amount: '', // Start with empty string instead of 0
                period: 'monthly',
                require_receipts: false
            })
            setActiveTab('edit') // Show edit tab for new budgets
        }
    }, [budget, mode])

    const handleSave = async () => {
        setIsLoading(true)
        try {
            // Convert limit_amount to number if it's a string
            const budgetData = {
                ...formData,
                limit_amount: typeof formData.limit_amount === 'string'
                    ? parseFloat(formData.limit_amount) || 0
                    : formData.limit_amount
            }
            await onSave(budgetData)
            onClose()
        } catch (error) {
            console.error('Error saving budget:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!budget || !onDelete) return

        setIsLoading(true)
        try {
            await onDelete(budget.id)
            onClose()
        } catch (error) {
            console.error('Error deleting budget:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getPeriodColor = (period: string) => {
        switch (period) {
            case 'monthly':
                return 'bg-blue-100 text-blue-800'
            case 'weekly':
                return 'bg-green-100 text-green-800'
            case 'quarterly':
                return 'bg-purple-100 text-purple-800'
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {mode === 'create' ? 'Create New Budget' : budget?.name || 'Budget Details'}
                        </h2>
                        {budget && (
                            <div className="flex space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodColor(budget.period)}`}>
                                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                                </span>
                                {budget.require_receipts && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        Receipts Required
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {budget && (
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
                                            <span>Delete Budget</span>
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

                {/* Tabs - Only show if budget exists */}
                {budget && (
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
                    {activeTab === 'overview' && budget ? (
                        <div className="space-y-6">
                            {/* Budget Display */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Information</h3>
                                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 text-white shadow-lg">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-lg font-semibold mb-1">{budget.name}</h4>
                                            <p className="text-green-200 text-sm">Budget Limit</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-green-200">Limit</p>
                                            <p className="text-xl font-bold">{formatCurrency(budget.limit_amount)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-green-200 text-sm">Period</p>
                                            <p className="font-semibold text-sm capitalize">{budget.period}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-200 text-sm">Receipts</p>
                                            <p className="font-semibold text-sm">{budget.require_receipts ? 'Required' : 'Optional'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-green-200 text-sm">Created</p>
                                        <p className="font-semibold text-sm">
                                            {budget.created_at ? new Date(budget.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Stats */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Statistics</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            <span className="text-sm font-medium text-gray-900">Spent</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">$0.00</p>
                                        <p className="text-sm text-gray-500">0% of limit</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">Remaining</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget.limit_amount)}</p>
                                        <p className="text-sm text-gray-500">100% of limit</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Receipt className="h-5 w-5 text-orange-600" />
                                            <span className="text-sm font-medium text-gray-900">Transactions</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">0</p>
                                        <p className="text-sm text-gray-500">This period</p>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Settings */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Receipt Requirements</h4>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={budget.require_receipts}
                                                disabled
                                                className="rounded"
                                            />
                                            <span className="text-sm text-gray-600">Require receipts for all transactions</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {budget.require_receipts
                                                ? 'Receipts are required for all transactions in this budget'
                                                : 'Receipts are optional for transactions in this budget'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Budget Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter budget name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget Amount *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.limit_amount}
                                            onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                                            className="block w-full pl-7 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Period *
                                    </label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.require_receipts}
                                        onChange={(e) => setFormData({ ...formData, require_receipts: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Require receipts for all transactions
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    When enabled, users will be required to upload receipts for all transactions in this budget
                                </p>
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