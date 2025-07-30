'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ReceiptModal2Props {
    isOpen: boolean
    onClose: () => void
}

export default function ReceiptModal2({ isOpen, onClose }: ReceiptModal2Props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [dateAdded, setDateAdded] = useState('')
    const [dateOfPurchase, setDateOfPurchase] = useState('')

    // Uneditable fields (for now, these would be populated from the uploaded file or API)
    const [type, setType] = useState('Image')
    const [receiptId, setReceiptId] = useState('550e8400-e29b-41d4-a716-446655440000') // UUID format
    const [url, setUrl] = useState('https://example.com/receipts/rec-2024-001.pdf')
    const [accountId, setAccountId] = useState('550e8400-e29b-41d4-a716-446655440001') // UUID format

    const handleSave = () => {
        // Close modal for now as requested
        onClose()
    }

    const handleCancel = () => {
        // Close modal for now as requested
        onClose()
    }

    const handleAIParse = () => {
        // Does nothing for now as requested
        console.log('AI Parse button clicked')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add Receipt Information
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload successful. Kindly complete the receipt information fields below, or ask AI Parse Information and confirm output after.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex p-6 space-x-6">
                    {/* Left Column - Document Preview */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h3>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="bg-white h-full rounded border border-gray-200 p-4 overflow-auto">
                                <div className="text-sm text-gray-600">
                                    <p className="mb-2">Document preview will appear here...</p>
                                    <p>This area will display the uploaded receipt image or PDF.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Button */}
                    <div className="flex items-center px-4">
                        <button
                            onClick={handleAIParse}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            AI Parse
                        </button>
                    </div>

                    {/* Right Column - Receipt Information */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Information</h3>
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="receipt-name" className="block text-xs font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="receipt-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter receipt name"
                                />
                            </div>

                            {/* Description Field */}
                            <div>
                                <label htmlFor="receipt-description" className="block text-xs font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="receipt-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter receipt description"
                                />
                            </div>

                            {/* Amount Field */}
                            <div>
                                <label htmlFor="receipt-amount" className="block text-xs font-medium text-gray-700 mb-1">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    id="receipt-amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>

                            {/* Date of Purchase Field */}
                            <div>
                                <label htmlFor="receipt-date-purchase" className="block text-xs font-medium text-gray-700 mb-1">
                                    Date of Purchase
                                </label>
                                <input
                                    type="date"
                                    id="receipt-date-purchase"
                                    value={dateOfPurchase}
                                    onChange={(e) => setDateOfPurchase(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Type Field (Uneditable) */}
                            <div>
                                <label htmlFor="receipt-type" className="block text-xs font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <input
                                    type="text"
                                    id="receipt-type"
                                    value={type}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    readOnly
                                />
                            </div>

                            {/* Date Added Field (Uneditable) */}
                            <div>
                                <label htmlFor="receipt-date-added" className="block text-xs font-medium text-gray-700 mb-1">
                                    Date Added
                                </label>
                                <input
                                    type="text"
                                    id="receipt-date-added"
                                    value={dateAdded || new Date().toLocaleDateString()}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    readOnly
                                />
                            </div>

                            {/* ID Field (Uneditable) */}
                            <div>
                                <label htmlFor="receipt-id" className="block text-xs font-medium text-gray-700 mb-1">
                                    ID
                                </label>
                                <input
                                    type="text"
                                    id="receipt-id"
                                    value={receiptId}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    readOnly
                                />
                            </div>

                            {/* URL Field (Uneditable) */}
                            <div>
                                <label htmlFor="receipt-url" className="block text-xs font-medium text-gray-700 mb-1">
                                    URL
                                </label>
                                <input
                                    type="text"
                                    id="receipt-url"
                                    value={url}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    readOnly
                                />
                            </div>

                            {/* Account ID Field (Uneditable) */}
                            <div>
                                <label htmlFor="receipt-account-id" className="block text-xs font-medium text-gray-700 mb-1">
                                    Account ID
                                </label>
                                <input
                                    type="text"
                                    id="receipt-account-id"
                                    value={accountId}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
} 