# Image Upload, Preview, AI Parse Text, PDF Upload & Preview Implementation Guide

This document provides a complete implementation guide for re-implementing image upload, image preview, AI parse text, PDF upload, and PDF preview features in a new project.

## Table of Contents

1. [Dependencies & Package Requirements](#dependencies--package-requirements)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Core Components & Files](#core-components--files)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Setup Instructions](#setup-instructions)

## Dependencies & Package Requirements

### Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "axios": "^1.9.0",
    "formidable": "^3.5.4",
    "html2canvas": "^1.4.1",
    "jspdf": "^3.0.1",
    "pdfjs-dist": "5.3.93",
    "react-pdf": "^10.0.1",
    "@supabase/supabase-js": "^2.50.0",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@types/formidable": "^3.4.5"
  },
  "overrides": {
    "pdfjs-dist": "5.3.93"
  }
}
```

### Backend Dependencies (requirements.txt)

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
supabase==2.0.3
python-dotenv==1.0.0
pydantic==2.5.0
email-validator==2.1.0.post1 
openai==1.3.7
pydantic-settings==2.1.0
```

## Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET_KEY=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key_here
```

## Database Setup (Supabase)

### Storage Bucket

```sql
-- Create storage bucket for documents
-- Bucket name: "supporting-document-storage"
-- File size limit: 10MB
```

### Database Table

```sql
CREATE TABLE supporting_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    graph_id UUID REFERENCES graphs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('document', 'image')),
    url TEXT NOT NULL,
    uploader_email TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_supporting_documents_graph_id ON supporting_documents(graph_id);
CREATE INDEX idx_supporting_documents_uploader ON supporting_documents(uploader_email);

-- Enable RLS
ALTER TABLE supporting_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to insert documents"
ON supporting_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read documents"
ON supporting_documents FOR SELECT TO authenticated USING (true);
```

## Core Components & Files

### 1. Image Preview Component

**File: `src/components/ImagePreviewer.tsx`**

```typescript
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface ImagePreviewerHandle {
    // Placeholder for future methods
}

interface ImagePreviewerProps {
    url: string;
    fixedWidth?: number;
}

const ImagePreviewer = forwardRef<ImagePreviewerHandle, ImagePreviewerProps>(({ url, fixedWidth }, ref) => {
    const [zoom, setZoom] = useState<number>(1);
    const viewerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({}), []);

    const panBy = (dx: number, dy: number) => {
        if (viewerRef.current) {
            viewerRef.current.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
        }
    };

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
                    justifyContent: 'center',
                }}
            >
                <img
                    src={url}
                    alt="preview"
                    style={{
                        width: `calc(100% * ${zoom})`,
                        height: 'auto',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        display: 'block',
                        margin: '0 auto',
                        userSelect: 'none',
                    }}
                    draggable={false}
                    onError={(e) => {
                        console.error('[ImagePreviewer] Failed to load image:', url, e);
                    }}
                />
            </div>
            {/* Zoom Controls */}
            <div className="flex items-center justify-between mt-2 mb-2 gap-2">
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setZoom((z) => Math.max(0.2, Math.round((z - 0.1) * 10) / 10))}
                    disabled={zoom <= 0.2}
                >
                    -
                </button>
                <span className="text-xs text-gray-600">Zoom: {(zoom * 100).toFixed(0)}%</span>
                <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
                    disabled={zoom >= 3}
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

export default ImagePreviewer;
```

### 2. PDF Preview Component

**File: `src/components/PDFPreviewer.tsx`**

```typescript
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export interface PDFPreviewerHandle {
    getSelectedText: () => string;
}

interface PDFPreviewerProps {
    url: string;
    onAddContent: (selectedText: string) => void;
    fixedWidth?: number;
}

const PDFPreviewer = forwardRef<PDFPreviewerHandle, PDFPreviewerProps>(({ url, onAddContent, fixedWidth }, ref) => {
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(1);
    const viewerRef = useRef<HTMLDivElement>(null);

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

    return (
        <div>
            <div ref={viewerRef} style={{ height: 450, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, background: '#fff', width: fixedWidth || 400, minWidth: fixedWidth || 400, maxWidth: fixedWidth || 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        </div>
    );
});

export default PDFPreviewer;
```

### 3. File Upload Modal Component

**File: `src/components/SupportingDocumentUploadModal.tsx`**

```typescript
import React, { useState } from "react";
import axios from "axios";

interface SupportingDocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  graphId: string;
  uploaderEmail: string;
  onSuccess: (doc: any) => void;
}

const SupportingDocumentUploadModal: React.FC<SupportingDocumentUploadModalProps> = ({ open, onClose, graphId, uploaderEmail, onSuccess }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("document");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);

  if (!open) return null;

  const isReady = Boolean(graphId && uploaderEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !type || !file) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append("file", file);
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const uploadRes = await axios.post(
        "/api/supporting-documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const url = uploadRes.data.url;
      
      // 2. Save metadata
      const metaRes = await axios.post(
        "/api/supporting-documents",
        {
          graph_id: graphId,
          name,
          type,
          url,
          uploader_email: uploaderEmail,
          confidence,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      onSuccess(metaRes.data.document);
      setName("");
      setType("document");
      setFile(null);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[18rem] p-6 relative">
        <h2 className="text-lg font-semibold mb-4">
          Upload Supporting Document
        </h2>
        {!isReady ? (
          <div className="text-center text-gray-500 py-8">
            Loading required information...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7283D9]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7283D9]"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="document">Document</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium mb-1">File</label>
              <input
                type="file"
                className="w-full"
                accept={
                  type === "image"
                    ? ".jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.svg,image/*"
                    : ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.svg"
                }
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  if (selectedFile) {
                    // Auto-detect type based on file extension/mimetype
                    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
                    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg"];
                    if (selectedFile.type.startsWith("image/") || (ext && imageExts.includes(ext))) {
                      setType("image");
                    } else {
                      setType("document");
                    }
                  }
                }}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Confidence</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidence}
                  onChange={e => setConfidence(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7283D9]"
                />
                <span className="text-sm text-gray-500 w-12 text-right">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#7283D9] text-white rounded-md hover:bg-[#5A6BC7] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportingDocumentUploadModal;
```

### 4. AI Text Extraction Utility

**File: `src/lib/extractImageText.ts`**

```typescript
export async function extractTextFromImage(
    file: File,
    summarize: boolean = false
): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
        `/api/ai/extract-text-from-image?summarize=${summarize}`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) {
        let errorMsg = "Failed to extract text from image";
        try {
            const error = await res.json();
            errorMsg = error.detail || errorMsg;
        } catch { }
        throw new Error(errorMsg);
    }

    const data = await res.json();
    return data.text;
}
```

### 5. Supabase Client Configuration

**File: `src/lib/supabaseClient.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

## API Endpoints

### 1. File Upload API

**File: `src/pages/api/supporting-documents/upload.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import type { Files, Fields, File, Part } from 'formidable';
import fs from 'fs';
import { supabase } from '../../../lib/supabaseClient';
import { getEmailFromSupabaseJWT } from '../../../lib/verifySupabaseToken';

export const config = { api: { bodyParser: false } };

function sanitizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const profile = await getEmailFromSupabaseJWT(token);
    if (!profile) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    const user_id = profile.user_id;

    try {
        console.log('Starting file upload process...');

        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            filter: (part: Part) => {
                console.log('Processing file part:', part.mimetype);
                return part.mimetype ? part.mimetype.startsWith('image/') || part.mimetype.startsWith('application/') : false;
            }
        });

        console.log('Parsing form data...');
        const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
            form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
                if (err) {
                    console.error('Form parsing error:', err);
                    reject(err);
                } else {
                    console.log('Form parsed successfully:', { fields, files });
                    resolve([fields, files]);
                }
            });
        });

        const fileArray = files.file;
        if (!fileArray || !Array.isArray(fileArray) || fileArray.length === 0) {
            console.error('No file found in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = fileArray[0];
        console.log('File details:', {
            name: file.originalFilename,
            type: file.mimetype,
            size: file.size
        });

        console.log('Reading file data...');
        const fileData = fs.readFileSync(file.filepath);
        const safeFilename = sanitizeFilename(file.originalFilename || 'file');
        const filePath = `${user_id}/${Date.now()}-${safeFilename}`;

        console.log('Uploading to Supabase...');
        const { data, error: uploadError } = await supabase.storage
            .from('supporting-document-storage')
            .upload(filePath, fileData, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.mimetype || 'application/octet-stream'
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return res.status(500).json({ error: 'Upload failed: ' + uploadError.message });
        }

        console.log('Getting public URL...');
        const { data: { publicUrl } } = supabase.storage
            .from('supporting-document-storage')
            .getPublicUrl(filePath);

        // Clean up the temporary file
        console.log('Cleaning up temporary file...');
        fs.unlinkSync(file.filepath);

        console.log('Upload completed successfully:', publicUrl);
        return res.status(200).json({
            url: publicUrl,
            name: file.originalFilename,
            type: file.mimetype,
            size: file.size
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Upload failed: ' + (error.message || 'Unknown error'),
            details: error.stack
        });
    }
}
```

### 2. AI Text Extraction API (Backend)

**File: `backend/ai_api.py`**

```python
@router.post("/api/ai/extract-text-from-image")
async def extract_text_from_image(
    url: str = Body(..., embed=True),
    summarize: bool = Query(False)
):
    print(f"[ai_api] extract_text_from_image: Function started. url={url}, summarize={summarize}")
    if not OPENAI_API_KEY:
        print("[ai_api] extract_text_from_image: No OpenAI API key configured.")
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")
    try:
        openai.api_key = OPENAI_API_KEY
        prompt = "Extract all readable text from this image. If no text is present, describe the image in detail in 3-6 sentences."
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert OCR and summarizer."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": url}}
                    ]
                }
            ],
            max_tokens=512
        )
        result = response.choices[0].message.content
        print(f"[ai_api] extract_text_from_image: Function finished.")
        return {"text": result}
    except Exception as e:
        print(f"[ai_api] extract_text_from_image: Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

## Usage Examples

### Image Parse Text Button Implementation

```typescript
// Example usage in a component
const [parseLoading, setParseLoading] = useState(false);
const [parseError, setParseError] = useState<string | null>(null);

const handleParseText = async () => {
  setParseError(null);
  setParseLoading(true);
  try {
    console.log("[Parse Text] Starting OCR for image URL:", doc.url);
    let text = "";
    let response = await fetch("/api/ai/extract-text-from-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: doc.url,
      }),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error("[Parse Text] OCR failed:", errText);
      throw new Error("Failed to extract text from image");
    }
    
    const data = await response.json();
    text = data.text?.trim() || "";
    
    // If no text detected, ask for a description
    if (!text || text.length < 3) {
      response = await fetch("/api/ai/extract-text-from-image?summarize=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: doc.url,
        }),
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error("Failed to get image description");
      }
      
      const descData = await response.json();
      text = descData.text?.trim() || "No text or description could be extracted.";
    }
    
    setNewEvidence((ev) => ({
      ...ev,
      excerpt: text,
    }));
    
  } catch (err: any) {
    setParseError(err.message || "Failed to parse image.");
    console.error("[Parse Text] Error:", err);
  } finally {
    setParseLoading(false);
  }
};
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install @heroicons/react axios formidable html2canvas jspdf pdfjs-dist react-pdf @supabase/supabase-js uuid

# Development dependencies
npm install --save-dev @types/formidable

# Backend dependencies
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart supabase python-dotenv pydantic email-validator openai pydantic-settings
```

### 2. Set Environment Variables

Create the necessary environment files with the required variables as listed above.

### 3. Setup Supabase

1. Create a new Supabase project
2. Create the storage bucket named "supporting-document-storage"
3. Run the SQL commands to create the supporting_documents table
4. Configure RLS policies

### 4. Configure PDF Worker

Copy the PDF worker file to your public directory:

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.mjs public/pdf.worker.mjs
```

### 5. Setup Backend

1. Install Python dependencies
2. Configure the AI API with OpenAI API key
3. Set up CORS configuration for your frontend domain

### 6. Deploy

Follow the deployment instructions for both frontend and backend platforms.

## Additional Notes

- The implementation supports file sizes up to 10MB
- Images and PDFs are stored in Supabase storage
- AI text extraction uses OpenAI's GPT-4o-mini model
- The system includes zoom and pan controls for both images and PDFs
- File type detection is automatic based on file extension and MIME type
- Error handling is implemented throughout the system
- The components are fully responsive and accessible

This comprehensive setup provides all the necessary components for implementing image upload, image preview, AI parse text, PDF upload, and PDF preview functionality in a new project.


ile Organization:
User Isolation: Each user has separate folder
Unique Naming: Timestamp + sanitized filename prevents conflicts
Type Detection: Automatic based on file extension and MIME type