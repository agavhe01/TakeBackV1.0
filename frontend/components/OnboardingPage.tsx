'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Users, CreditCard, Settings, BarChart3 } from 'lucide-react'

interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    organization_legal_name: string
}

export default function OnboardingPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(1)
    const [error, setError] = useState('')

    useEffect(() => {
        console.log('=== ONBOARDING PAGE LOADED ===')
        console.log('Checking authentication status...')

        const checkAuth = async () => {
            const token = localStorage.getItem('access_token')
            const userData = localStorage.getItem('user')

            console.log('Token exists:', !!token)
            console.log('User data exists:', !!userData)

            if (!token || !userData) {
                console.log('No token or user data found, redirecting to signin...')
                router.push('/signin')
                return
            }

            try {
                console.log('Parsing user data...')
                const parsedUser = JSON.parse(userData)
                console.log('User data:', parsedUser)
                setUser(parsedUser)

                // Verify token is still valid
                console.log('Verifying token with backend...')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                console.log('Profile verification response status:', response.status)

                if (!response.ok) {
                    console.log('Token verification failed, redirecting to signin...')
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('user')
                    router.push('/signin')
                    return
                }

                console.log('Token verified successfully')

            } catch (err) {
                console.error('Error checking authentication:', err)
                setError('Authentication error')
                router.push('/signin')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const handleCompleteOnboarding = () => {
        console.log('Onboarding completed, redirecting to dashboard...')
        router.push('/dashboard')
    }

    const handleSkipOnboarding = () => {
        console.log('Onboarding skipped, redirecting to dashboard...')
        router.push('/dashboard')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading onboarding...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/signin')}
                        className="bg-primary-500 text-white px-4 py-2 rounded-md"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        )
    }

    const steps = [
        {
            id: 1,
            title: "Welcome to TakeBack",
            description: "Let's get your organization set up for success",
            icon: CheckCircle,
            content: (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome, {user?.first_name}!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        We're excited to help {user?.organization_legal_name} manage spending with confidence.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                            <strong>Your account is ready!</strong> You can start using TakeBack immediately,
                            or complete this quick setup to get the most out of your experience.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "Set Up Your Team",
            description: "Add employees who will use company cards",
            icon: Users,
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Setup</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                                You can add team members later from your dashboard. For now, let's continue with the setup.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Account created successfully</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Organization profile set up</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: "Configure Budgets",
            description: "Set spending limits for different departments",
            icon: BarChart3,
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Configuration</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Create budgets for different departments or projects. You can set monthly, weekly, or quarterly limits.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Marketing Budget</h4>
                                <p className="text-sm text-gray-600">Monthly limit: $5,000</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Operations Budget</h4>
                                <p className="text-sm text-gray-600">Monthly limit: $3,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            title: "Issue Company Cards",
            description: "Create virtual or physical cards for your team",
            icon: CreditCard,
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Management</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Issue cards to team members with specific budget limits and spending controls.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Virtual Cards</h4>
                                <p className="text-sm text-gray-600">Instant issuance, perfect for online purchases</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Physical Cards</h4>
                                <p className="text-sm text-gray-600">Traditional cards for in-person transactions</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 5,
            title: "Set Up Policies",
            description: "Configure spending rules and approval workflows",
            icon: Settings,
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Configuration</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Set up spending policies to ensure compliance and control costs.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-700">Require receipts for purchases over $25</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-700">Automatic categorization of transactions</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-700">Real-time spending alerts</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ]

    const currentStepData = steps.find(step => step.id === currentStep)

    // Safety check for currentStepData
    if (!currentStepData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Invalid step configuration</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-primary-500 text-white px-4 py-2 rounded-md"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">TakeBack Setup</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Step {currentStep} of {steps.length}
                            </span>
                            <button
                                onClick={handleSkipOnboarding}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-2 py-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1">
                                <div className={`h-2 rounded-full ${step.id <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
                                    }`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Step Header */}
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <currentStepData.icon className="h-6 w-6 text-primary-600" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {currentStepData.title}
                                </h2>
                                <p className="text-gray-600">{currentStepData.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-6">
                        {currentStepData.content}
                    </div>

                    {/* Navigation */}
                    <div className="border-t border-gray-200 p-6">
                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                disabled={currentStep === 1}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${currentStep === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:text-gray-900'
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex space-x-3">
                                {currentStep < steps.length ? (
                                    <button
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                        className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md font-medium"
                                    >
                                        <span>Next</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCompleteOnboarding}
                                        className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md font-medium"
                                    >
                                        <span>Complete Setup</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 