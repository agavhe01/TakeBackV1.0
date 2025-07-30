'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, ArrowLeftRight, Edit, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import ReceiptModal from '../../components/ReceiptModal'
import ReceiptModal2 from '../../components/ReceiptModal2'

interface Receipt {
    id: string // UUID
    type: string
    name: string
    description: string
    amount: number
    date_added: string
    date_of_purchase: string
    url: string
    account_id: string // UUID
}

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModal2Open, setIsModal2Open] = useState(false)

    useEffect(() => {
        // For now, we're not fetching any receipts as requested
        setIsLoading(false)
    }, [])

    const handleAddReceipt = () => {
        setIsModalOpen(true)
    }

    const handleNext = () => {
        setIsModalOpen(false)
        setIsModal2Open(true)
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

    const getTotalAmount = () => {
        return receipts.reduce((total, r) => total + r.amount, 0)
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
                        <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
                        <p className="text-gray-600 mt-1">
                            Total: {formatCurrency(getTotalAmount())} • {receipts.length} receipts
                        </p>
                    </div>
                    <button
                        onClick={handleAddReceipt}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Receipt</span>
                    </button>
                </div>

                {/* Receipts Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Receipt Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Added
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date of Purchase
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {receipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {receipt.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(receipt.amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(receipt.date_added)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(receipt.date_of_purchase)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {receipt.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => console.log('Edit receipt:', receipt.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => console.log('Delete receipt:', receipt.id)}
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

                    {receipts.length === 0 && (
                        <div className="text-center py-12">
                            <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by adding a new receipt.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleAddReceipt}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                                    Add Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Receipt Modal */}
                <ReceiptModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onNext={handleNext}
                />

                {/* Receipt Modal 2 */}
                <ReceiptModal2
                    isOpen={isModal2Open}
                    onClose={() => setIsModal2Open(false)}
                />
            </div>
        </DashboardLayout>
    )
} 