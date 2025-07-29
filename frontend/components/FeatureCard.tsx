import { Check, X, Users, BarChart3 } from 'lucide-react'

export default function FeatureCard() {
    return (
        <div className="relative">
            {/* Grant Card Popup */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">SVF Grant Card</h3>
                        <p className="text-sm text-gray-600">Allocated for general expenses</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                        Overview
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Edit
                    </button>
                </div>

                {/* Transaction Card */}
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">a Amazon</p>
                                <p className="text-xs text-gray-500">Yesterday 9:32 PM</p>
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">$658.33</span>
                    </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">G</span>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">T</span>
                        </div>
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">A</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">+4</span>
                        </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">TakeBack</span>
                </div>

                {/* Status Items */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">Receipt Uploaded</span>
                    </div>
                    <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">Budget Assigned</span>
                    </div>
                </div>

                {/* Budget Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Budget Assigned</span>
                        <span className="text-sm font-semibold text-gray-900">30</span>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Budget
                        </label>
                        <select className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                            <option>SVF Grant</option>
                            <option>Fall Retreat</option>
                            <option>General Admin</option>
                        </select>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                </div>
            </div>

            {/* Marketing Text */}
            <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-2">Issue Cards. Control Spend. Maximize Impact.</h2>
                <p className="text-lg opacity-90">Track your organization's growth and impact in real-time</p>

                {/* Dots indicator */}
                <div className="flex justify-center mt-6 space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                </div>
            </div>
        </div>
    )
} 