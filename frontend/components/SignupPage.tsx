'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Info, Leaf } from 'lucide-react'
import FeatureCard from './FeatureCard'

interface SignupFormData {
    first_name: string
    last_name: string
    email: string
    phone: string
    password: string
    confirm_password: string
    organization_legal_name?: string
    orginazation_ein_number?: string
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
        console.log('Signup successful, redirecting to onboarding...')
        router.push('/onboarding')
    }

    // TEMPORARY TEST FUNCTION - REMOVE AFTER TESTING
    const testSignupWithoutOrganization = async () => {
        console.log('=== TESTING SIGNUP WITHOUT ORGANIZATION FIELDS ===')

        const testData = {
            first_name: 'Test',
            last_name: 'User',
            email: `test${Date.now()}@example.com`,
            phone: '1234567890',
            password: 'testpassword123',
            confirm_password: 'testpassword123'
            // No organization fields
        }

        console.log('Test data:', testData)

        setIsLoading(true)
        setError('')

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

        try {
            const response = await fetch(`${apiUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            })

            console.log('Test response status:', response.status)
            const result = await response.json()
            console.log('Test response result:', result)

            if (response.ok) {
                console.log('✅ TEST PASSED: Signup without organization fields works!')
                setError('✅ TEST PASSED: Signup without organization fields works!')
            } else {
                console.log('❌ TEST FAILED:', result)
                setError(`❌ TEST FAILED: ${JSON.stringify(result)}`)
            }
        } catch (err) {
            console.error('Test error:', err)
            setError(`Test error: ${err}`)
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (data: SignupFormData) => {
        console.log('Form submitted with data:', data)
        console.log('Environment variables:')
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
        console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

        // Prevent multiple submissions
        if (isLoading) {
            console.log('Form submission blocked - already loading')
            return
        }

        setIsLoading(true)
        setError('')

        // Filter out empty optional fields
        const submitData = {
            ...data,
            organization_legal_name: data.organization_legal_name?.trim() || undefined,
            orginazation_ein_number: data.orginazation_ein_number?.trim() || undefined
        }

        // Remove undefined values
        Object.keys(submitData).forEach(key => {
            if (submitData[key as keyof typeof submitData] === undefined) {
                delete submitData[key as keyof typeof submitData]
            }
        })

        console.log('Filtered submit data:', submitData)

        // Get API URL with fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        console.log('Using API URL:', apiUrl)
        console.log('Full request URL:', `${apiUrl}/api/auth/signup`)

        try {
            console.log('Making fetch request...')
            const response = await fetch(`${apiUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            })

            console.log('Response status:', response.status)
            console.log('Response headers:', Object.fromEntries(response.headers.entries()))

            const result = await response.json()
            console.log('Response result:', result)

            if (response.ok) {
                // Store token in localStorage (this automatically logs in the user)
                localStorage.setItem('access_token', result.access_token)
                localStorage.setItem('user', JSON.stringify(result.user))

                // The user is now automatically logged in after signup
                console.log('User automatically logged in after signup')
                handleSignupSuccess()
            } else {
                // Handle different types of error responses
                let errorMessage = 'Signup failed'

                if (result.detail) {
                    if (Array.isArray(result.detail)) {
                        // Handle validation errors array
                        errorMessage = result.detail.map((error: any) => error.msg || error.message || 'Validation error').join(', ')
                    } else if (typeof result.detail === 'string') {
                        errorMessage = result.detail
                    } else {
                        errorMessage = 'Signup failed - please check your information'
                    }
                }

                setError(errorMessage)
            }
        } catch (err) {
            console.error('Signup error:', err)
            console.error('Error details:', {
                name: err instanceof Error ? err.name : 'Unknown',
                message: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : 'No stack trace'
            })
            setError('Network error. Please try again.')
        } finally {
            console.log('Setting isLoading to false')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Section - Signup Form */}
            <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-8">
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
                                <a
                                    href="/signin"
                                    className="text-primary-500 hover:text-primary-600 font-medium"
                                    onClick={() => console.log('Signin link clicked, navigating to /signin')}
                                >
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First *
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 ${errors.first_name ? 'border-red-300' : 'border-gray-300'
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
                                        className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 ${errors.last_name ? 'border-red-300' : 'border-gray-300'
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
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 ${errors.email ? 'border-red-300' : 'border-gray-300'
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
                                        className={`block w-full pl-16 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={`block w-full pr-10 py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 ${errors.password ? 'border-red-300' : 'border-gray-300'
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
                                            className={`block w-full pr-10 py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'
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
                                        Organization Legal Name
                                        <Info className="h-4 w-4 ml-1 text-gray-400" />
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                                    {...register('organization_legal_name')}
                                />
                            </div>

                            {/* EIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Employer Identification Number (EIN)
                                </label>
                                <input
                                    type="text"
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                                    placeholder="12-3456789"
                                    {...register('orginazation_ein_number')}
                                />
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
                                Sign Up & Start Onboarding
                            </button>

                            {/* TEMPORARY TEST BUTTON - REMOVE AFTER TESTING */}
                            <button
                                type="button"
                                onClick={testSignupWithoutOrganization}
                                disabled={isLoading}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 mt-2"
                            >
                                🧪 Test Signup Without Organization Fields
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Section - Feature Showcase (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 bg-primary-500 items-center justify-center relative">
                <FeatureCard />
            </div>
        </div>
    )
} 