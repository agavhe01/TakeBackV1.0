import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
}

export default function FormInput({ label, error, ...props }: FormInputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${error ? 'border-red-300' : 'border-gray-300'
                    }`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
} 