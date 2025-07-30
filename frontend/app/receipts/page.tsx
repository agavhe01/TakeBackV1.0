'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, ArrowLeftRight, Edit, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import ReceiptModal from '../../components/ReceiptModal'
import ReceiptDetailsModal from '../../components/ReceiptDetailsModal'
import ReceiptModal2 from '../../components/ReceiptModal2'
import { API_URLS, getReceiptUrl } from '../../config'

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
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Receipt details for the second modal
    const [uploadedFileUrl, setUploadedFileUrl] = useState('')
    const [uploadedFileName, setUploadedFileName] = useState('')
    const [uploadedFileType, setUploadedFileType] = useState('')

    const fetchReceipts = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const userData = localStorage.getItem('user')
            console.log('Receipts page - Token found:', !!token)
            console.log('Receipts page - Token length:', token ? token.length : 0)
            console.log('Receipts page - User data found:', !!userData)

            if (!token) {
                console.log('No authentication token found - user may not be logged in')
                setIsAuthenticated(false)
                setIsLoading(false)
                return
            }

            setIsAuthenticated(true)
            console.log('Receipts page - User authenticated, fetching receipts...')
            const response = await fetch(API_URLS.RECEIPTS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setReceipts(data)
            } else if (response.status === 401) {
                console.log('Authentication failed - user may need to log in again')
                setIsAuthenticated(false)
                // Don't show error for auth issues, just set empty receipts
                setReceipts([])
            } else {
                console.error('Failed to fetch receipts:', response.status, response.statusText)
            }
        } catch (error) {
            console.error('Error fetching receipts:', error)
            // Don't show error for network issues, just set empty receipts
            setReceipts([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReceipts()
    }, [])

    const handleAddReceipt = () => {
        if (!isAuthenticated) {
            console.log('User not authenticated - cannot add receipt')
            return
        }
        setIsModalOpen(true)
    }

    const handleUploadSuccess = (fileUrl: string, fileName: string, fileType: string) => {
        setUploadedFileUrl(fileUrl)
        setUploadedFileName(fileName)
        setUploadedFileType(fileType)
        setIsModalOpen(false)
        setIsDetailsModalOpen(true)
    }

    const handleSaveReceipt = async (receiptData: {
        name: string
        amount: number
        dateOfPurchase: string
        description?: string
    }) => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.log('No authentication token found for save operation')
                return
            }

            // Only create receipt if we have uploaded file data
            if (!uploadedFileUrl) {
                console.error('No file uploaded - cannot create receipt')
                return
            }

            // Create the receipt record in the database
            const response = await fetch(API_URLS.RECEIPTS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: receiptData.name,
                    type: uploadedFileType,
                    description: receiptData.description,
                    amount: receiptData.amount,
                    date_of_purchase: receiptData.dateOfPurchase,
                    url: uploadedFileUrl
                })
            })

            if (response.ok) {
                // Refresh receipts list
                await fetchReceipts()
                setIsDetailsModalOpen(false)
                // Reset state
                setUploadedFileUrl('')
                setUploadedFileName('')
                setUploadedFileType('')
            } else {
                console.error('Failed to save receipt')
            }
        } catch (error) {
            console.error('Error saving receipt:', error)
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        // Reset state
        setUploadedFileUrl('')
        setUploadedFileName('')
        setUploadedFileType('')
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
        return receipts.reduce((total, r) => total + (r.amount || 0), 0)
    }

    const handleEditReceipt = (receipt: Receipt) => {
        setSelectedReceipt(receipt)
        setIsEditModalOpen(true)
    }

    const handleUpdateReceipt = async (receiptData: {
        name: string
        amount: number
        dateOfPurchase: string
        description?: string
    }) => {
        if (!selectedReceipt) return

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.log('No authentication token found for update operation')
                return
            }

            const url = getReceiptUrl(selectedReceipt.id)
            const requestBody = {
                name: receiptData.name,
                description: receiptData.description,
                amount: receiptData.amount,
                date_of_purchase: receiptData.dateOfPurchase
            }

            console.log('Updating receipt:', {
                url,
                method: 'PUT',
                receiptId: selectedReceipt.id,
                requestBody
            })

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            })

            console.log('Update response status:', response.status)
            console.log('Update response headers:', response.headers)

            if (response.ok) {
                // Refresh receipts list
                await fetchReceipts()
                setIsEditModalOpen(false)
                setSelectedReceipt(null)
            } else {
                const errorText = await response.text()
                console.error('Failed to update receipt:', response.status, response.statusText, errorText)
            }
        } catch (error) {
            console.error('Error updating receipt:', error)
        }
    }

    const handleDeleteReceipt = async (receiptId: string) => {
        if (!confirm('Are you sure you want to delete this receipt?')) {
            return
        }

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.log('No authentication token found for delete operation')
                return
            }

            const response = await fetch(getReceiptUrl(receiptId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                // Remove from local state
                setReceipts(receipts.filter(r => r.id !== receiptId))
            } else if (response.status === 401) {
                console.log('Authentication failed during delete - user may need to log in again')
            } else {
                console.error('Failed to delete receipt:', response.status, response.statusText)
            }
        } catch (error) {
            console.error('Error deleting receipt:', error)
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
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
                        <p className="text-gray-600 mt-1">
                            {isAuthenticated ? (
                                `Total: ${formatCurrency(getTotalAmount())} • ${receipts.length} receipts`
                            ) : (
                                'Please sign in to view and manage receipts'
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleAddReceipt}
                        disabled={!isAuthenticated}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${isAuthenticated
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
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
                                                {receipt.amount ? formatCurrency(receipt.amount) : '-'}
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
                                                    onClick={() => handleEditReceipt(receipt)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReceipt(receipt.id)}
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {isAuthenticated ? 'No receipts' : 'Sign in to view receipts'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {isAuthenticated
                                    ? 'Get started by adding a new receipt.'
                                    : 'Please sign in to view and manage your receipts.'
                                }
                            </p>
                            {isAuthenticated && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleAddReceipt}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                                        Add Receipt
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Upload Modal */}
                <ReceiptModal
                    key={`upload-modal-${isModalOpen}`} // Force re-render when modal opens
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onNext={handleUploadSuccess}
                />

                {/* Details Modal */}
                <ReceiptDetailsModal
                    key={`${uploadedFileUrl}-${uploadedFileName}`} // Force re-render when file changes
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    fileUrl={uploadedFileUrl}
                    fileName={uploadedFileName}
                    fileType={uploadedFileType}
                    onSave={handleSaveReceipt}
                />

                {/* Edit Modal */}
                <ReceiptModal2
                    key={`edit-modal-${selectedReceipt?.id}`} // Force re-render when receipt changes
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setSelectedReceipt(null)
                    }}
                    receipt={selectedReceipt || undefined}
                    onSave={handleUpdateReceipt}
                />
            </div>
        </DashboardLayout>
    )
} 