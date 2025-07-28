'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Info, Leaf } from 'lucide-react'
import FeatureCard from './FeatureCard'

interface SignupFormData {
    first_name: string
    last_name: string
    date_of_birth: string
    address: string
    zip_code: string
    ssn: string
    phone: string
    email: string
    password: string
    confirm_password: string
    organization_legal_name: string
    orginazation_ein_number: string
}

export default function SignupPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        clearErrors
    } = useForm<SignupFormData>({
        mode: 'onSubmit' // Only validate on submit
    })

    const password = watch('password')

    const handleSignupSuccess = () => {
        router.push('/onboarding')
    }

    const onSubmit = async (data: SignupFormData) => {
        console.log('Form submitted with data:', data)
        console.log('Environment variables:')
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
        console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

        setIsLoading(true)
        setError('')

        // Get API URL with fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        console.log('Using API URL:', apiUrl)
        console.log('Full request URL:', `${apiUrl}/api/auth/signup`)

        try {
            const response = await fetch(`${apiUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            console.log('Response status:', response.status)
            const result = await response.json()
            console.log('Response result:', result)

            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('access_token', result.access_token)
                localStorage.setItem('user', JSON.stringify(result.user))
                handleSignupSuccess()
            } else {
                setError(result.detail || 'Signup failed')
            }
        } catch (err) {
            console.error('Signup error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Section - Signup Form */}
            <div className="flex-1 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="w-full">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center mb-4">
                                <Leaf className="h-8 w-8 text-primary-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Get Started with TakeBack
                            </h1>
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
                                    Sign in
                                </a>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First *
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.first_name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        {...register('first_name', {
                                            required: 'First name is required',
                                            minLength: {
                                                value: 1,
                                                message: 'First name is required'
                                            }
                                        })}
                                    />
                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last *
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.last_name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        {...register('last_name', {
                                            required: 'Last name is required',
                                            minLength: {
                                                value: 1,
                                                message: 'Last name is required'
                                            }
                                        })}
                                    />
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'}`}
                                    {...register('date_of_birth', {
                                        required: 'Date of birth is required'
                                    })}
                                />
                                {errors.date_of_birth && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="123 Main St, City, State"
                                    {...register('address', {
                                        required: 'Address is required'
                                    })}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                )}
                            </div>

                            {/* Zip Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zip Code *
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.zip_code ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="12345"
                                    {...register('zip_code', {
                                        required: 'Zip code is required',
                                        pattern: {
                                            value: /^\d{5}(-\d{4})?$/,
                                            message: 'Please enter a valid zip code'
                                        }
                                    })}
                                />
                                {errors.zip_code && (
                                    <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                                )}
                            </div>

                            {/* SSN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Social Security Number *
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.ssn ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="123-45-6789"
                                    {...register('ssn', {
                                        required: 'SSN is required',
                                        pattern: {
                                            value: /^\d{3}-\d{2}-\d{4}$/,
                                            message: 'Please enter SSN in format XXX-XX-XXXX'
                                        }
                                    })}
                                />
                                {errors.ssn && (
                                    <p className="mt-1 text-sm text-red-600">{errors.ssn.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">🇺🇸 +1</span>
                                    </div>
                                    <input
                                        type="tel"
                                        className={`block w-full pl-16 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                        {...register('phone', {
                                            required: 'Phone number is required'
                                        })}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={`block w-full pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters'
                                                }
                                            })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className={`block w-full pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            {...register('confirm_password', {
                                                required: 'Please confirm your password',
                                                validate: value => value === password || 'Passwords do not match'
                                            })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Organization Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="flex items-center">
                                        Organization Legal Name *
                                        <Info className="h-4 w-4 ml-1 text-gray-400" />
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.organization_legal_name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    {...register('organization_legal_name', {
                                        required: 'Organization name is required',
                                        minLength: {
                                            value: 1,
                                            message: 'Organization name is required'
                                        }
                                    })}
                                />
                                {errors.organization_legal_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.organization_legal_name.message}</p>
                                )}
                            </div>

                            {/* EIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Employer Identification Number (EIN) *
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.orginazation_ein_number ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="12-3456789"
                                    {...register('orginazation_ein_number', {
                                        required: 'EIN is required',
                                        pattern: {
                                            value: /^\d{2}-\d{7}$/,
                                            message: 'Please enter EIN in format XX-XXXXXXX'
                                        }
                                    })}
                                />
                                {errors.orginazation_ein_number && (
                                    <p className="mt-1 text-sm text-red-600">{errors.orginazation_ein_number.message}</p>
                                )}
                            </div>



                            {/* Terms */}
                            <p className="text-sm text-gray-600">
                                By signing up, you agree to receive text messages from TakeBack. View our{' '}
                                <a href="#" className="text-primary-500 hover:text-primary-600">
                                    Terms
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary-500 hover:text-primary-600">
                                    Privacy Policy
                                </a>
                                .
                            </p>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                            >
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                Sign Up and Start Onboarding
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Section - Feature Showcase */}
            <div className="flex-1 bg-primary-500 flex items-center justify-center relative">
                <FeatureCard />
            </div>
        </div>
    )
} 