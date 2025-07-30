-- Supabase Storage Setup for TakeBack Receipts
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('supporting-documents-storage-bucket', 'supporting-documents-storage-bucket', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'supporting-documents-storage-bucket' 
  AND auth.role() = 'authenticated'
);

-- 4. Create policy to allow users to view their own files
CREATE POLICY "Allow users to view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'supporting-documents-storage-bucket' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'supporting-documents-storage-bucket' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Create policy to allow service role full access (for backend operations)
CREATE POLICY "Allow service role full access" ON storage.objects
FOR ALL USING (
  bucket_id = 'supporting-documents-storage-bucket' 
  AND auth.role() = 'service_role'
);

-- Alternative: If you want to disable RLS completely (less secure but easier for development)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; 