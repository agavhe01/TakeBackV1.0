'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { API_URLS } from '../config'
import PDFPreviewer, { PDFPreviewerHandle } from './PDFPreviewer'
import ImagePreviewer from './ImagePreviewer'

interface ReceiptDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    fileUrl: string
    fileName: string
    fileType: string
    onSave: (receiptData: {
        name: string
        amount: number
        dateOfPurchase: string
        description?: string
    }) => void
}

export default function ReceiptDetailsModal({
    isOpen,
    onClose,
    fileUrl,
    fileName,
    fileType,
    onSave
}: ReceiptDetailsModalProps) {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [dateOfPurchase, setDateOfPurchase] = useState('')
    const [description, setDescription] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const pdfPreviewerRef = useRef<PDFPreviewerHandle>(null)

    // Reset form state when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            setName(fileName.replace(/\.[^/.]+$/, '')) // Remove file extension
            setAmount('')
            setDateOfPurchase('')
            setDescription('')
            setError('')
        }
    }, [isOpen, fileName])

    const handleSave = async () => {
        if (!name.trim() || !amount.trim() || !dateOfPurchase.trim()) {
            setError('Please fill in all required fields')
            return
        }

        setIsSaving(true)
        setError('')

        try {
            const receiptData = {
                name: name.trim(),
                amount: parseFloat(amount),
                dateOfPurchase: dateOfPurchase,
                description: description.trim() || undefined
            }

            await onSave(receiptData)
            onClose()
        } catch (error) {
            console.error('Error saving receipt:', error)
            setError('Failed to save receipt. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const renderPreview = () => {
        // Check if it's a PDF file
        const isPDF = fileUrl.toLowerCase().endsWith('.pdf') || fileType === 'document';

        if (fileType === 'image' || fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/)) {
            return (
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">Image Preview</label>
                    <ImagePreviewer url={fileUrl} fixedWidth={400} />
                </div>
            )
        } else if (isPDF) {
            return (
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-2">PDF Preview</label>
                    <PDFPreviewer
                        ref={pdfPreviewerRef}
                        url={fileUrl}
                        fixedWidth={400}
                    />
                </div>
            )
        } else {
            return (
                <div className="flex justify-center">
                    <div className="text-gray-600 text-center">
                        <p>File preview not available</p>
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Download file
                        </a>
                    </div>
                </div>
            )
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Add Receipt Information
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Preview */}
                        <div>
                            {renderPreview()}
                        </div>

                        {/* Right Column - Form */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Receipt Information</h3>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter receipt name"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Date of Purchase */}
                                <div>
                                    <label htmlFor="dateOfPurchase" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Purchase *
                                    </label>
                                    <input
                                        type="date"
                                        id="dateOfPurchase"
                                        value={dateOfPurchase}
                                        onChange={(e) => setDateOfPurchase(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter receipt description (optional)"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim() || !amount.trim() || !dateOfPurchase.trim()}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSaving || !name.trim() || !amount.trim() || !dateOfPurchase.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSaving ? 'Saving...' : 'Save Receipt'}
                    </button>
                </div>
            </div>
        </div>
    )
} 