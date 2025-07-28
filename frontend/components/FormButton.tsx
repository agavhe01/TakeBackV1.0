import React from 'react'
import { Loader2 } from 'lucide-react'

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    children: React.ReactNode
}

export default function FormButton({ isLoading, children, ...props }: FormButtonProps) {
    return (
        <button
            disabled={isLoading}
            className={`flex items-center justify-center ${props.className || ''}`}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
            {children}
        </button>
    )
} 