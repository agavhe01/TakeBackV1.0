'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { CheckCircle, ArrowRight, ArrowLeft, Clock, User, Building, Shield } from 'lucide-react'

interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    organization_legal_name: string
    orginazation_ein_number: string
    phone?: string
}

interface PersonalInfoForm {
    first_name: string
    last_name: string
    date_of_birth: string
    phone: string
    organization_legal_name: string
    organization_ein: string
    ssn: string
    address: string
    zip_code: string
}

export default function OnboardingPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(1)
    const [error, setError] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationComplete, setVerificationComplete] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<PersonalInfoForm>()

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

                // Pre-fill form with existing data
                console.log('User data from localStorage:', parsedUser)
                setValue('first_name', parsedUser.first_name || '')
                setValue('last_name', parsedUser.last_name || '')
                setValue('organization_legal_name', parsedUser.organization_legal_name || '')
                setValue('phone', parsedUser.phone || '')
                setValue('organization_ein', parsedUser.orginazation_ein_number || '') // Pre-fill EIN
                setValue('ssn', '') // Ensure SSN is blank
                // Log the form state after pre-filling
                setTimeout(() => {
                    console.log('Form state after pre-fill:', watch())
                }, 100);
                console.log('Pre-filled form data:')
                console.log('- organization_ein:', parsedUser.orginazation_ein_number || '')
                console.log('- ssn: (blank)')
                console.log('- phone:', parsedUser.phone || '')
                console.log('- date_of_birth: (not set yet)')

                // Verify token is still valid
                console.log('Verifying token with backend...')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const response = await fetch(`${apiUrl}/api/auth/profile`, {
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
    }, [router, setValue])

    const handleNextStep = async () => {
        if (currentStep < 3) {
            // Save current step data before proceeding
            await saveCurrentStepData()
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const saveCurrentStepData = async () => {
        console.log(`Saving data for step ${currentStep}...`)
        setIsSaving(true)

        try {
            const formData = watch()
            console.log('Current form data:', formData)

            const token = localStorage.getItem('access_token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            // Prepare data based on current step
            let updateData = {}

            if (currentStep === 1) {
                // Step 1: Personal Information
                updateData = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    date_of_birth: formData.date_of_birth,
                    phone: formData.phone
                }
            } else if (currentStep === 2) {
                // Step 2: Organization & Address
                updateData = {
                    organization_legal_name: formData.organization_legal_name,
                    orginazation_ein_number: formData.organization_ein,
                    ssn: formData.ssn,
                    address: formData.address,
                    zip_code: formData.zip_code
                }
            }

            console.log(`Sending step ${currentStep} data:`, updateData)

            const response = await fetch(`${apiUrl}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            })

            if (response.ok) {
                console.log(`Step ${currentStep} data saved successfully`)
                setSaveSuccess(true)
                // Clear success message after 2 seconds
                setTimeout(() => setSaveSuccess(false), 2000)
            } else {
                const errorData = await response.json()
                console.error(`Failed to save step ${currentStep} data:`, errorData)
                setError(`Failed to save step ${currentStep} data: ${errorData.detail}`)
            }
        } catch (err) {
            console.error(`Error saving step ${currentStep} data:`, err)
            setError(`Network error saving step ${currentStep} data. Please try again.`)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSkipOnboarding = () => {
        console.log('Onboarding skipped, redirecting to dashboard...')
        router.push('/dashboard')
    }

    const handleVerifyDetails = async () => {
        setIsVerifying(true)

        // Simulate verification process
        setTimeout(() => {
            setIsVerifying(false)
            setVerificationComplete(true)

            // After verification, update user profile and redirect to dashboard
            setTimeout(() => {
                handleCompleteOnboarding()
            }, 1000)
        }, 5000)
    }

    const handleCompleteOnboarding = async () => {
        console.log('Onboarding completed, redirecting to dashboard...')

        // Data has already been saved in previous steps
        // Just redirect to dashboard
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
            title: "Personal Information",
            description: "Verify your personal details",
            icon: User,
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Legal First Name *
                            </label>
                            <input
                                type="text"
                                className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.first_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                {...register('first_name', {
                                    required: 'First name is required'
                                })}
                            />
                            {errors.first_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Legal Last Name *
                            </label>
                            <input
                                type="text"
                                className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.last_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                {...register('last_name', {
                                    required: 'Last name is required'
                                })}
                            />
                            {errors.last_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                                }`}
                            {...register('date_of_birth', {
                                required: 'Date of birth is required'
                            })}
                        />
                        {errors.date_of_birth && (
                            <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Phone Number *
                        </label>
                        <input
                            type="tel"
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="(123) 456-7890"
                            {...register('phone', {
                                required: 'Phone number is required'
                            })}
                        />
                        <p className="mt-1 text-sm text-gray-500">We will never share your number.</p>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "Organization & Address",
            description: "Complete your business and address information",
            icon: Building,
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Organization Legal Name *
                        </label>
                        <input
                            type="text"
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.organization_legal_name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            {...register('organization_legal_name', {
                                required: 'Organization name is required'
                            })}
                        />
                        {errors.organization_legal_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.organization_legal_name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Organization EIN *
                        </label>
                        <input
                            type="text"
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.organization_ein ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="12-3456789"
                            {...register('organization_ein', {
                                required: 'EIN is required',
                                pattern: {
                                    value: /^\d{2}-\d{7}$/,
                                    message: 'Please enter EIN in format XX-XXXXXXX'
                                }
                            })}
                        />
                        {errors.organization_ein && (
                            <p className="mt-1 text-sm text-red-600">{errors.organization_ein.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Social Security Number *
                        </label>
                        <input
                            type="text"
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.ssn ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="123-45-6789"
                            {...register('ssn', {
                                required: 'SSN is required',
                                pattern: {
                                    value: /^\d{3}-\d{2}-\d{4}$/,
                                    message: 'Please enter SSN in format XXX-XX-XXXX'
                                }
                            })}
                        />
                        <p className="mt-1 text-sm text-gray-500">We won't check or impact your credit score.</p>
                        {errors.ssn && (
                            <p className="mt-1 text-sm text-red-600">{errors.ssn.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Address (No PO boxes) *
                        </label>
                        <textarea
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.address ? 'border-red-300' : 'border-gray-300'
                                }`}
                            rows={3}
                            placeholder="Enter your complete address including street, city, state, etc."
                            {...register('address', {
                                required: 'Address is required'
                            })}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zip Code *
                        </label>
                        <input
                            type="text"
                            className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.zip_code ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="12345"
                            {...register('zip_code', {
                                required: 'Zip code is required'
                            })}
                        />
                        {errors.zip_code && (
                            <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: "Verify Details",
            description: "We'll verify your information",
            icon: Shield,
            content: (
                <div className="text-center space-y-6">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <Clock className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900">
                        Verify your personal information
                    </h3>

                    <p className="text-gray-600 max-w-md mx-auto">
                        This button does not actually do anything and simulates a fake verification, simply click on it to continue with the rest of the application
                    </p>

                    {isVerifying ? (
                        <div className="space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                            <p className="text-gray-600">Verifying your information...</p>
                        </div>
                    ) : verificationComplete ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-green-600 font-medium">Verification complete!</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleVerifyDetails}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md font-medium"
                        >
                            Verify Details
                        </button>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-blue-800 text-sm">
                            To help the government fight the funding of terrorism and money laundering activities,
                            federal law requires us to obtain, verify, and record information that identifies each
                            individual or entity that opens an account.
                        </p>
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
                        {saveSuccess && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                ✓ Step {currentStep} data saved successfully
                            </div>
                        )}
                        {currentStepData.content}
                    </div>

                    {/* Navigation */}
                    {currentStep !== 3 && (
                        <div className="border-t border-gray-200 p-6">
                            <div className="flex justify-between">
                                <button
                                    onClick={handlePreviousStep}
                                    disabled={currentStep === 1}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${currentStep === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    <ArrowLeft className="h-4 w-4 inline mr-2" />
                                    Previous
                                </button>

                                <button
                                    onClick={handleNextStep}
                                    disabled={isSaving}
                                    className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Next</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
} 