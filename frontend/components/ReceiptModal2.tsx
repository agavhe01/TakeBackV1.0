'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import PDFPreviewer, { PDFPreviewerHandle } from './PDFPreviewer'
import ImagePreviewer from './ImagePreviewer'

interface ReceiptModal2Props {
    isOpen: boolean
    onClose: () => void
    fileUrl?: string // Add optional fileUrl prop
    fileName?: string // Add optional fileName prop
}

export default function ReceiptModal2({ isOpen, onClose, fileUrl, fileName }: ReceiptModal2Props) {
    const [name, setName] = useState('Dine Inn Diner Meal')
    const [description, setDescription] = useState('Dine Inn Dinner Meal\n123 Main Street\nGreat Meal')
    const [amount, setAmount] = useState('200')
    const [dateAdded, setDateAdded] = useState('')
    const [dateOfPurchase, setDateOfPurchase] = useState('2025-07-28')
    const pdfPreviewerRef = useRef<PDFPreviewerHandle>(null)

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
        onClose()
    }

    const handleAIParse = () => {
        // AI parsing functionality would go here
        console.log('AI parsing triggered')
    }

    const renderPreview = () => {
        // Check if it's a PDF file
        const isPDF = fileUrl && (fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().includes('pdf'));

        if (fileUrl && (fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/) || fileUrl.toLowerCase().includes('image'))) {
            return (
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">Image Preview</label>
                    <ImagePreviewer url={fileUrl} fixedWidth={350} />
                </div>
            )
        } else if (isPDF) {
            return (
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">PDF Preview</label>
                    <PDFPreviewer
                        ref={pdfPreviewerRef}
                        url={fileUrl}
                        fixedWidth={350}
                    />
                </div>
            )
        } else {
            return (
                <div className="flex justify-center">
                    <div className="text-gray-600 text-center">
                        <p>File preview not available</p>
                        {fileUrl && (
                            <a
                                href={fileUrl}
                                download={fileName || 'receipt.pdf'}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Download file
                            </a>
                        )}
                    </div>
                </div>
            )
        }
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
                                {renderPreview()}
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
                                    Name*
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

                            {/* Amount Field */}
                            <div>
                                <label htmlFor="receipt-amount" className="block text-xs font-medium text-gray-700 mb-1">
                                    Amount*
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
                                    Date of Purchase*
                                </label>
                                <input
                                    type="date"
                                    id="receipt-date-purchase"
                                    value={dateOfPurchase}
                                    onChange={(e) => setDateOfPurchase(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Description Field */}
                            <div>
                                <label htmlFor="receipt-description" className="block text-xs font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="receipt-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter receipt description"
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
                        Save Receipt
                    </button>
                </div>
            </div>
        </div>
    )
} 