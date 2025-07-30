'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import PDFPreviewer, { PDFPreviewerHandle } from './PDFPreviewer'
import ImagePreviewer from './ImagePreviewer'

interface Receipt {
    id: string
    name: string
    type: string
    description?: string
    amount?: number
    url: string
    date_added: string
    date_of_purchase: string
    account_id: string
}

interface ReceiptModal2Props {
    isOpen: boolean
    onClose: () => void
    fileUrl?: string // Add optional fileUrl prop
    fileName?: string // Add optional fileName prop
    receipt?: Receipt // Add optional receipt prop for editing
    onSave?: (receiptData: {
        name: string
        amount: number
        dateOfPurchase: string
        description?: string
    }) => void // Add optional onSave prop
}

export default function ReceiptModal2({ isOpen, onClose, fileUrl, fileName, receipt, onSave }: ReceiptModal2Props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [dateAdded, setDateAdded] = useState('')
    const [dateOfPurchase, setDateOfPurchase] = useState('')
    const pdfPreviewerRef = useRef<PDFPreviewerHandle>(null)

    // Uneditable fields (for now, these would be populated from the uploaded file or API)
    const [type, setType] = useState('')
    const [receiptId, setReceiptId] = useState('')
    const [url, setUrl] = useState('')
    const [accountId, setAccountId] = useState('')

    // Load receipt data when editing
    useEffect(() => {
        if (receipt) {
            setName(receipt.name)
            setDescription(receipt.description || '')
            setAmount(receipt.amount ? receipt.amount.toString() : '')
            setDateAdded(receipt.date_added)
            // Convert date format for input field (YYYY-MM-DD)
            if (receipt.date_of_purchase) {
                const date = new Date(receipt.date_of_purchase)
                const formattedDate = date.toISOString().split('T')[0]
                setDateOfPurchase(formattedDate)
            } else {
                setDateOfPurchase('')
            }
            setType(receipt.type)
            setReceiptId(receipt.id)
            setUrl(receipt.url)
            setAccountId(receipt.account_id)
        } else {
            // Reset form for new receipt
            setName('')
            setDescription('')
            setAmount('')
            setDateAdded('')
            setDateOfPurchase('')
            setType('')
            setReceiptId('')
            setUrl('')
            setAccountId('')
        }
    }, [receipt])

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please enter a receipt name')
            return
        }

        if (!amount.trim()) {
            alert('Please enter an amount')
            return
        }

        if (!dateOfPurchase) {
            alert('Please enter a date of purchase')
            return
        }

        const receiptData = {
            name: name.trim(),
            amount: parseFloat(amount),
            dateOfPurchase: dateOfPurchase,
            description: description.trim() || undefined
        }

        if (onSave) {
            onSave(receiptData)
        } else {
            // Default behavior - just close modal
            onClose()
        }
    }

    const handleCancel = () => {
        onClose()
    }

    const handleAIParse = () => {
        // AI parsing functionality would go here
        console.log('AI parsing triggered')
    }

    const renderPreview = () => {
        // Use receipt URL if editing, otherwise use fileUrl
        const previewUrl = receipt ? receipt.url : fileUrl

        // Check if it's a PDF file
        const isPDF = previewUrl && (previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.toLowerCase().includes('pdf'));

        if (previewUrl && (previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/) || previewUrl.toLowerCase().includes('image'))) {
            return (
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">Image Preview</label>
                    <ImagePreviewer url={previewUrl} fixedWidth={350} />
                </div>
            )
        } else if (isPDF) {
            return (
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">PDF Preview</label>
                    <PDFPreviewer
                        ref={pdfPreviewerRef}
                        url={previewUrl}
                        fixedWidth={350}
                    />
                </div>
            )
        } else {
            return (
                <div className="flex justify-center">
                    <div className="text-gray-600 text-center">
                        <p>File preview not available</p>
                        {previewUrl && (
                            <a
                                href={previewUrl}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {receipt ? 'Edit Receipt Information' : 'Add Receipt Information'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {receipt
                                ? 'Edit the receipt information below, or use AI Parse to extract information from the document.'
                                : 'Upload successful. Kindly complete the receipt information fields below, or ask AI Parse Information and confirm output after.'
                            }
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
                <div className="flex-1 flex p-6 space-x-6 min-h-0">
                    {/* Left Column - Document Preview */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h3>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-0">
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
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Information</h3>
                        <div className="space-y-4 overflow-y-auto flex-1">
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
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
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
                        {receipt ? 'Update Receipt' : 'Save Receipt'}
                    </button>
                </div>
            </div>
        </div>
    )
} 