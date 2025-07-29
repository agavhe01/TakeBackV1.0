'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Leaf, BarChart3, Users, CreditCard, TrendingUp } from 'lucide-react'

interface SigninFormData {
    email: string
    password: string
}

export default function SigninPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SigninFormData>()

    const handleSigninSuccess = () => {
        console.log('Signin successful, redirecting to dashboard...')
        router.push('/dashboard')
    }

    const onSubmit = async (data: SigninFormData) => {
        console.log('=== SIGNIN REQUEST ===')
        console.log('Form submitted with data:', data)
        console.log('Environment variables:')
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
        console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

        setIsLoading(true)
        setError('')

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        console.log('Using API URL:', apiUrl)
        console.log('Full request URL:', `${apiUrl}/api/auth/login`)

        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
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
                console.log('Login successful, storing tokens...')
                localStorage.setItem('access_token', result.access_token)
                localStorage.setItem('user', JSON.stringify(result.user))
                handleSigninSuccess()
            } else {
                console.log('Login failed:', result.detail)
                setError(result.detail || 'Login failed')
            }
        } catch (err) {
            console.error('Signin error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Section - Signin Form */}
            <div className="flex-1 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="w-full">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center mb-4">
                                <Leaf className="h-8 w-8 text-primary-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Sign in to your account
                            </h1>
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <a
                                    href="/"
                                    className="text-primary-500 hover:text-primary-600 font-medium underline"
                                    onClick={() => console.log('Signup link clicked, navigating to /')}
                                >
                                    Sign up for free
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

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
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

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <a href="#" className="text-sm text-primary-500 hover:text-primary-600">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`block w-full pr-10 py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                        {...register('password', {
                                            required: 'Password is required'
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                            >
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                Sign in
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Section - Data Visualization */}
            <div className="flex-1 bg-primary-500 flex items-center justify-center relative p-8">
                <div className="w-full max-w-4xl">
                    {/* Data Cards Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Total Cards */}
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Cards</p>
                                    <p className="text-2xl font-bold text-gray-900">137</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-primary-500" />
                            </div>
                        </div>

                        {/* Total Employees */}
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Employees</p>
                                    <p className="text-2xl font-bold text-gray-900">26</p>
                                </div>
                                <Users className="h-8 w-8 text-primary-500" />
                            </div>
                        </div>

                        {/* Spend by Card */}
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900">Spend by Card</p>
                                <BarChart3 className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="flex space-x-1 h-16 items-end">
                                <div className="flex-1 bg-primary-400 rounded-t" style={{ height: '60%' }}></div>
                                <div className="flex-1 bg-primary-600 rounded-t" style={{ height: '80%' }}></div>
                                <div className="flex-1 bg-primary-400 rounded-t" style={{ height: '40%' }}></div>
                                <div className="flex-1 bg-primary-600 rounded-t" style={{ height: '90%' }}></div>
                                <div className="flex-1 bg-primary-400 rounded-t" style={{ height: '70%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                            </div>
                        </div>

                        {/* Grant Spend-down */}
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900">Grant Spend-down</p>
                                <TrendingUp className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>SVS Grant</span>
                                        <span>60%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Full Retreat</span>
                                        <span>80%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>General Admin</span>
                                        <span>70%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <a href="#" className="text-xs text-primary-500 hover:text-primary-600 mt-2 inline-block">
                                Add more
                            </a>
                        </div>
                    </div>

                    {/* Spend by Program - Full Width */}
                    <div className="bg-white rounded-lg p-4 shadow-lg mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-900">Spend by Program</p>
                            <BarChart3 className="h-5 w-5 text-primary-500" />
                        </div>
                        <div className="h-32 flex items-end space-x-4">
                            <div className="flex-1 flex items-end space-x-2">
                                <div className="w-1 bg-primary-500 rounded-t" style={{ height: '60%' }}></div>
                                <div className="w-1 bg-primary-500 rounded-t" style={{ height: '80%' }}></div>
                                <div className="w-1 bg-primary-500 rounded-t" style={{ height: '40%' }}></div>
                                <div className="w-1 bg-primary-500 rounded-t" style={{ height: '90%' }}></div>
                            </div>
                            <div className="flex-1 flex items-end space-x-2">
                                <div className="w-1 bg-primary-300 rounded-t" style={{ height: '40%' }}></div>
                                <div className="w-1 bg-primary-300 rounded-t" style={{ height: '60%' }}></div>
                                <div className="w-1 bg-primary-300 rounded-t" style={{ height: '30%' }}></div>
                                <div className="w-1 bg-primary-300 rounded-t" style={{ height: '70%' }}></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Q1</span>
                            <span>Q2</span>
                            <span>Q3</span>
                            <span>Q4</span>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-bold mb-2">Track Every Dollar with Confidence</h2>
                        <p className="text-lg opacity-90">Assign budgets, tag grants, and stay audit-ready—automatically.</p>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center mt-8 space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white opacity-30 rounded-full"></div>
                        <div className="w-2 h-2 bg-white opacity-30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    )
} 