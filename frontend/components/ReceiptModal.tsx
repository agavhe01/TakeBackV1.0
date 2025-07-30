'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { API_URLS } from '../config'

interface ReceiptModalProps {
    isOpen: boolean
    onClose: () => void
    onNext: (fileUrl: string, fileName: string, fileType: string) => void
}

export default function ReceiptModal({ isOpen, onClose, onNext }: ReceiptModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [uploadedFileUrl, setUploadedFileUrl] = useState('')
    const [uploadedFileName, setUploadedFileName] = useState('')
    const [uploadedFileType, setUploadedFileType] = useState('')

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null)
            setIsUploading(false)
            setUploadMessage('')
            setUploadSuccess(false)
            setUploadedFileUrl('')
            setUploadedFileName('')
            setUploadedFileType('')

            // Clear the file input
            const fileInput = document.getElementById('file') as HTMLInputElement
            if (fileInput) {
                fileInput.value = ''
            }
        }
    }, [isOpen])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setSelectedFile(file)
        setUploadMessage('')
        setUploadSuccess(false)
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadMessage('Please select a file to upload.')
            return
        }

        setIsUploading(true)
        setUploadMessage('')

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const token = localStorage.getItem('access_token')
            if (!token) {
                setUploadMessage('Authentication required. Please sign in again.')
                return
            }

            const response = await fetch(API_URLS.RECEIPTS_UPLOAD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setUploadSuccess(true)
                setUploadMessage('File uploaded successfully!')
                setUploadedFileUrl(result.url)
                setUploadedFileName(selectedFile.name)
                setUploadedFileType(selectedFile.type.startsWith('image/') ? 'image' : 'document')
            } else if (response.status === 401) {
                setUploadMessage('Authentication failed. Please sign in again.')
            } else {
                setUploadMessage(result.detail || 'Failed to upload file.')
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploadMessage('An error occurred while uploading the file.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleNext = () => {
        if (uploadSuccess) {
            onNext(uploadedFileUrl, uploadedFileName, uploadedFileType)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Upload Receipt File
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* File Upload */}
                    <div>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                            Select File *
                        </label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>

                    {/* Upload Message */}
                    {uploadMessage && (
                        <div className={`p-3 rounded-md text-sm ${uploadSuccess
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {uploadMessage}
                        </div>
                    )}
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
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading || !selectedFile
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!uploadSuccess}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${uploadSuccess
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
} 