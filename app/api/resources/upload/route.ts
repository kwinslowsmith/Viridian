import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: PDF, images, videos' },
        { status: 400 }
      );
    }

    // Get organization from request header or session (would need to be passed by client)
    // For now, we'll generate a storage key without org prefix
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop() || 'file';
    const fileKey = `resources/${randomUUID()}-${Date.now()}.${fileExtension}`;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase storage is not configured' },
        { status: 503 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from('resources')
      .upload(fileKey, new Uint8Array(buffer), {
        contentType: file.type,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fileKey: data.path,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
