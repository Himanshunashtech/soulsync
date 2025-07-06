
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, userId: string, bucketName: 'profile-images' | 'chat-media' | 'post-images'): Promise<string | null> => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      // Store chat media in a subfolder per user for organization, similar to profile images
      const fileName = `${userId}/${Date.now()}.${fileExt}`; 
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        console.error(`Error uploading to ${bucketName}:`, error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Keep uploadImage for backward compatibility if it's used elsewhere for profile-images specifically
  // Or refactor its usages to use uploadFile with 'profile-images'
  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    return uploadFile(file, userId, 'profile-images');
  };

  return { uploadFile, uploadImage, uploading }; // exposing both for flexibility
};
