import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, WebP, and GIF images are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 5MB.';
  }
  return null;
}

export async function uploadImage(
  file: File,
  bucket: string,
  folder: string = ''
): Promise<{ url: string; path: string } | null> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const filePath = folder ? `${folder}/${filename}` : filename;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { url: data.publicUrl, path: filePath };
}

export async function deleteStorageFile(bucket: string, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}

export function getStoragePathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts.length > 1 ? pathParts[1] : null;
  } catch {
    return null;
  }
}
