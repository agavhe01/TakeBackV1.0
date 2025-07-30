import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

// Import styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export interface PDFPreviewerHandle {
    getSelectedText: () => string;
}

interface PDFPreviewerProps {
    url: string;
    onAddContent?: (selectedText: string) => void;
    fixedWidth?: number;
}

const PDFPreviewer = forwardRef<PDFPreviewerHandle, PDFPreviewerProps>(({ url, onAddContent, fixedWidth }, ref) => {
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(1);
    const [isClient, setIsClient] = useState(false);
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        // Set workerSrc for pdfjs only on client side
        import('react-pdf').then(({ pdfjs }) => {
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        });
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    useImperativeHandle(ref, () => ({
        getSelectedText: () => {
            let selectedText = '';
            if (window.getSelection) {
                selectedText = window.getSelection()?.toString() || '';
            }
            return selectedText;
        }
    }), []);

    const panBy = (dx: number, dy: number) => {
        if (viewerRef.current) {
            viewerRef.current.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
        }
    };

    if (!isClient) {
        return (
            <div
                style={{
                    height: 450,
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    marginBottom: 8,
                    background: '#fff',
                    width: fixedWidth || 400,
                    minWidth: fixedWidth || 400,
                    maxWidth: fixedWidth || 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div className="p-4 text-center">Loading PDF viewer...</div>
            </div>
        );
    }

    return (
        <div>
            <div
                ref={viewerRef}
                style={{
                    height: 450,
                    overflow: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    marginBottom: 8,
                    background: '#fff',
                    width: fixedWidth || 400,
                    minWidth: fixedWidth || 400,
                    maxWidth: fixedWidth || 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="p-4 text-center">Loading PDF...</div>}
                    error={<div className="p-4 text-center text-red-500">Failed to load PDF.</div>}
                >
                    <Page pageNumber={pageNumber} width={(fixedWidth || 400) * zoom} />
                </Document>
            </div>

            {/* Navigation and Zoom Controls */}
            <div className="flex items-center justify-between mt-2 mb-2 gap-2">
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                >
                    Previous
                </button>
                <span className="text-xs text-gray-600">
                    Page {pageNumber} of {numPages}
                </span>
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                >
                    Next
                </button>

                {/* Zoom Controls */}
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
                    disabled={zoom <= 0.5}
                >
                    -
                </button>
                <span className="text-xs text-gray-600">Zoom: {(zoom * 100).toFixed(0)}%</span>
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))}
                    disabled={zoom >= 2}
                >
                    +
                </button>
            </div>

            {/* Pan Controls */}
            <div className="flex flex-col items-center mb-2">
                <div className="flex justify-center mb-1">
                    <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        onClick={() => panBy(0, -50)}
                    >
                        ↑
                    </button>
                </div>
                <div className="flex justify-center gap-2">
                    <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        onClick={() => panBy(-50, 0)}
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        onClick={() => panBy(0, 50)}
                    >
                        ↓
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        onClick={() => panBy(50, 0)}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PDFPreviewer; 