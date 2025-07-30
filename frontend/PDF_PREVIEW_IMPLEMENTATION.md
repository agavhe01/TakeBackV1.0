# PDF Preview Implementation Guide

This document explains the PDF preview functionality implemented in the TakeBack application.

## Overview

The PDF preview system provides enhanced document viewing capabilities for receipts and other documents in the application. It includes:

- **PDF Previewer**: Full-featured PDF viewer with zoom, navigation, and text selection
- **Image Previewer**: Enhanced image viewer with zoom and pan controls
- **Integration**: Seamless integration with existing receipt modals

## Components

### 1. PDFPreviewer Component

**File**: `components/PDFPreviewer.tsx`

**Features**:
- PDF rendering using react-pdf
- Page navigation (Previous/Next)
- Zoom controls (50% - 200%)
- Pan controls (arrow keys)
- Text selection capability
- Client-side only rendering to avoid SSR issues

**Usage**:
```tsx
import PDFPreviewer, { PDFPreviewerHandle } from './PDFPreviewer'

const pdfPreviewerRef = useRef<PDFPreviewerHandle>(null)

<PDFPreviewer 
    ref={pdfPreviewerRef}
    url={pdfUrl} 
    fixedWidth={400}
/>
```

### 2. ImagePreviewer Component

**File**: `components/ImagePreviewer.tsx`

**Features**:
- Image rendering with zoom controls
- Pan controls for navigation
- Error handling for failed image loads
- Client-side only rendering

**Usage**:
```tsx
import ImagePreviewer from './ImagePreviewer'

<ImagePreviewer 
    url={imageUrl} 
    fixedWidth={400}
/>
```

## Integration with Receipt Modals

### ReceiptDetailsModal

The `ReceiptDetailsModal` component has been updated to use the new preview components:

- **Image files**: Uses `ImagePreviewer` with zoom and pan controls
- **PDF files**: Uses `PDFPreviewer` with full navigation and text selection
- **Other files**: Shows download link with fallback message

### ReceiptModal2

The `ReceiptModal2` component also supports the enhanced preview functionality with the same features.

## Technical Implementation

### Dependencies

```json
{
  "dependencies": {
    "react-pdf": "^10.0.1",
    "pdfjs-dist": "5.3.93"
  },
  "overrides": {
    "pdfjs-dist": "5.3.93"
  }
}
```

### PDF Worker Setup

The PDF worker file is copied to the public directory:
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.mjs public/pdf.worker.mjs
```

### SSR Compatibility

Both components are designed to work with Next.js SSR:

1. **Dynamic imports**: PDF components are loaded dynamically to avoid SSR issues
2. **Client-side only**: Components render a loading state during SSR
3. **Worker initialization**: PDF.js worker is initialized only on the client side

### Error Handling

- **PDF loading errors**: Shows error message with retry option
- **Image loading errors**: Logs errors and shows fallback
- **Network issues**: Graceful degradation with download links

## File Type Detection

The system automatically detects file types based on:

1. **File extension**: `.pdf`, `.jpg`, `.png`, etc.
2. **MIME type**: `application/pdf`, `image/*`
3. **URL patterns**: Contains "pdf" or "image" in the URL

## Usage Examples

### Basic PDF Preview
```tsx
<PDFPreviewer 
    url="https://example.com/document.pdf"
    fixedWidth={400}
/>
```

### With Text Selection
```tsx
const pdfRef = useRef<PDFPreviewerHandle>(null)

const handleGetSelectedText = () => {
    const selectedText = pdfRef.current?.getSelectedText() || ''
    console.log('Selected text:', selectedText)
}

<PDFPreviewer 
    ref={pdfRef}
    url={pdfUrl}
    onAddContent={handleGetSelectedText}
/>
```

### Image Preview with Zoom
```tsx
<ImagePreviewer 
    url="https://example.com/receipt.jpg"
    fixedWidth={400}
/>
```

## Testing

A test page is available at `/test-pdf` to demonstrate the functionality:

- Sample PDF file for testing
- Sample image for testing
- Interactive file selection
- Live preview demonstration

## Browser Compatibility

- **Modern browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Mobile browsers**: Responsive design with touch controls
- **Legacy browsers**: Graceful degradation with download links

## Performance Considerations

1. **Lazy loading**: PDF components are loaded only when needed
2. **Worker optimization**: PDF.js worker is shared across instances
3. **Memory management**: Proper cleanup of PDF resources
4. **Caching**: Browser caching for PDF and image files

## Troubleshooting

### Common Issues

1. **PDF not loading**: Check if the PDF worker file exists in `/public/pdf.worker.mjs`
2. **SSR errors**: Ensure components are client-side only
3. **CORS issues**: Verify PDF URLs allow cross-origin requests
4. **Memory leaks**: Check for proper component cleanup

### Debug Steps

1. Check browser console for errors
2. Verify PDF worker file is accessible
3. Test with different PDF files
4. Check network tab for failed requests

## Future Enhancements

Potential improvements for the PDF preview system:

1. **Text extraction**: AI-powered text extraction from images
2. **Annotations**: Add highlighting and annotation features
3. **Search**: Full-text search within PDFs
4. **Thumbnails**: Page thumbnails for navigation
5. **Print support**: Direct printing from preview
6. **Mobile optimization**: Touch gestures for mobile devices

## Security Considerations

1. **File validation**: Validate file types and sizes
2. **URL sanitization**: Ensure PDF URLs are safe
3. **CORS policies**: Configure proper CORS headers
4. **Content Security Policy**: Update CSP for PDF rendering

## Deployment Notes

1. **Build process**: PDF components are properly bundled
2. **Static assets**: PDF worker file is included in deployment
3. **Environment variables**: No additional environment setup required
4. **CDN compatibility**: Works with CDN-hosted PDFs

This implementation provides a robust, user-friendly PDF preview system that enhances the receipt management experience in the TakeBack application. 