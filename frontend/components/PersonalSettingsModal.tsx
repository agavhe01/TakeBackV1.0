'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'

interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    date_of_birth?: string
    address?: string
    zip_code?: string
    ssn?: string
    organization_legal_name: string
    orginazation_ein_number: string
    created_at: string
}

interface PersonalSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
}

export default function PersonalSettingsModal({ isOpen, onClose, user }: PersonalSettingsModalProps) {
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        zip_code: '',
        ssn: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                phone: user.phone || '',
                address: user.address || '',
                zip_code: user.zip_code || '',
                ssn: user.ssn || ''
            })
        }
    }, [user, isOpen])

    const handleSave = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setIsSuccess(true)
                setTimeout(() => {
                    setIsSuccess(false)
                    onClose()
                }, 2000)
            } else {
                throw new Error('Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Personal Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-6">
                        {/* Success Message */}
                        {isSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span className="text-green-800 font-medium">Profile updated successfully!</span>
                                </div>
                            </div>
                        )}

                        {/* Read-only Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={user?.first_name || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={user?.last_name || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Date of Birth
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={user?.date_of_birth || ''}
                                    disabled
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    rows={3}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter full address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.zip_code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter ZIP code"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SSN
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.ssn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ssn: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter SSN"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Read-only Fields */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information (Read-only)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Organization Legal Name
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.organization_legal_name || ''}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Organization EIN Number
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.orginazation_ein_number || ''}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Account ID
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.id || ''}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Account Created
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
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
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                        <Save className="h-4 w-4" />
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
} 