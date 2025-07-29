'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, Filter, Calendar, Receipt } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import BudgetModal from '../../components/BudgetModal'

interface Budget {
    id: string
    account_id: string
    name: string
    limit_amount: number
    period: 'monthly' | 'weekly' | 'quarterly'
    require_receipts: boolean
    created_at: string
}

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'monthly' | 'quarterly'>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [recentBudget, setRecentBudget] = useState<Budget | null>(null)

    useEffect(() => {
        fetchBudgets()
    }, [])

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
                // Sort by created_at in descending order to ensure most recent first
                const sortedData = data.sort((a: Budget, b: Budget) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                setBudgets(sortedData)
                // Set the most recent budget (first in the sorted list)
                if (sortedData.length > 0) {
                    setRecentBudget(sortedData[0])
                }
            } else {
                console.error('Failed to fetch budgets')
            }
        } catch (error) {
            console.error('Error fetching budgets:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateBudget = () => {
        setSelectedBudget(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEditBudget = (budget: Budget) => {
        setSelectedBudget(budget)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleSaveBudget = async (budgetData: Partial<Budget>) => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            if (modalMode === 'create') {
                // Create new budget
                const response = await fetch(`${apiUrl}/api/budgets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(budgetData)
                })

                if (response.ok) {
                    await fetchBudgets() // Refresh the budgets list
                } else {
                    throw new Error('Failed to create budget')
                }
            } else {
                // Update existing budget
                const response = await fetch(`${apiUrl}/api/budgets/${selectedBudget?.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(budgetData)
                })

                if (response.ok) {
                    await fetchBudgets() // Refresh the budgets list
                } else {
                    throw new Error('Failed to update budget')
                }
            }
        } catch (error) {
            console.error('Error saving budget:', error)
            throw error
        }
    }

    const handleDeleteBudget = async (budgetId: string) => {
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/budgets/${budgetId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                await fetchBudgets() // Refresh the budgets list
            } else {
                throw new Error('Failed to delete budget')
            }
        } catch (error) {
            console.error('Error deleting budget:', error)
            throw error
        }
    }

    const filteredBudgets = activeTab === 'all'
        ? budgets
        : budgets.filter(budget => budget.period === activeTab)

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

    const getPeriodIcon = (period: string) => {
        switch (period) {
            case 'weekly':
                return <Calendar className="h-4 w-4 text-green-600" />
            case 'monthly':
                return <Calendar className="h-4 w-4 text-blue-600" />
            case 'quarterly':
                return <Calendar className="h-4 w-4 text-purple-600" />
            default:
                return <Calendar className="h-4 w-4 text-gray-600" />
        }
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
                    <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
                    <button
                        onClick={handleCreateBudget}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Budget</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                        {(['all', 'weekly', 'monthly', 'quarterly'] as const).map((tab) => (
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

                {/* Budgets Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Limit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Receipts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBudgets.map((budget) => (
                                    <tr key={budget.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditBudget(budget)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {budget.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Created {new Date(budget.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatCurrency(budget.limit_amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} limit
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {getPeriodIcon(budget.period)}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodColor(budget.period)}`}>
                                                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                $0.00 / {formatCurrency(budget.limit_amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">0% used</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <Receipt className="h-4 w-4 text-orange-600" />
                                                <span className="text-sm text-gray-900">
                                                    {budget.require_receipts ? 'Required' : 'Optional'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredBudgets.length === 0 && (
                        <div className="text-center py-12">
                            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new budget.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleCreateBudget}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                                    Add Budget
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

            {/* Budget Modal */}
            <BudgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                budget={selectedBudget}
                onSave={handleSaveBudget}
                onDelete={handleDeleteBudget}
                mode={modalMode}
                recentBudget={recentBudget}
            />
        </DashboardLayout>
    )
} 