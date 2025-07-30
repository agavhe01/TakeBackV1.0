#!/bin/bash

echo "Installing PDF dependencies..."
npm install react-pdf pdfjs-dist html2canvas jspdf

echo "Copying PDF worker file..."
cp node_modules/pdfjs-dist/build/pdf.worker.mjs public/pdf.worker.mjs

echo "Setup complete!" 