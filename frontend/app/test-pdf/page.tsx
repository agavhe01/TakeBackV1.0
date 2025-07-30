'use client'

import { useState, useRef } from 'react'
import PDFPreviewer, { PDFPreviewerHandle } from '../../components/PDFPreviewer'
import ImagePreviewer from '../../components/ImagePreviewer'

export default function TestPDFPage() {
    const [selectedFile, setSelectedFile] = useState<string>('')
    const pdfPreviewerRef = useRef<PDFPreviewerHandle>(null)

    const sampleFiles = [
        {
            name: 'Sample PDF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf'
        },
        {
            name: 'Sample Image',
            url: 'https://picsum.photos/800/600',
            type: 'image'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">PDF Preview Test</h1>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Select a file to preview:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sampleFiles.map((file, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedFile(file.url)}
                                className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedFile === file.url
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-medium">{file.name}</div>
                                <div className="text-sm text-gray-600">{file.type.toUpperCase()}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedFile && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Preview</h2>
                        <div className="flex justify-center">
                            {selectedFile.includes('pdf') ? (
                                <PDFPreviewer
                                    ref={pdfPreviewerRef}
                                    url={selectedFile}
                                    fixedWidth={600}
                                />
                            ) : (
                                <ImagePreviewer
                                    url={selectedFile}
                                    fixedWidth={600}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 