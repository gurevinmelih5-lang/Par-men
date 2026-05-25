import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';
import { moderateImage } from './moderation';
import toast from 'react-hot-toast';

export const compressImage = async (file: File, options?: any): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    initialQuality: 0.8,
    ...options
  };
  
  try {
    return await imageCompression(file, defaultOptions);
  } catch (error) {
    console.error('Image compression failed', error);
    return file; // fallback to original
  }
};

export const uploadImageToStorage = async (file: File, bucket: string = 'book-covers'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return publicUrl;
    }
  } catch (error) {
    console.error('Storage upload error:', error);
  }
  return null;
};

export const processAndUploadImage = async (file: File, bucket: string = 'book-covers', requireModeration: boolean = true): Promise<string | null> => {
  // 1. Compress
  const compressed = await compressImage(file);
  
  // 2. Moderate
  if (requireModeration) {
    const isSafe = await moderateImage(compressed);
    if (!isSafe) {
      toast.error('Görsel uygunsuz içerik içeriyor.');
      return null;
    }
  }
  
  // 3. Upload
  return await uploadImageToStorage(compressed, bucket);
};
