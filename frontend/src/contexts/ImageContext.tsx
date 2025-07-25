import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Image, ImageContextType } from '../types';
import { apiService } from '../services/api';

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImage = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const getImages = useCallback(async (folderId?: string, page: number = 1, limit: number = 20): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.getImages(folderId, page, limit);
      setImages(response.images);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Get images error:', error);
      setImages([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File, name: string, folderId: string): Promise<void> => {
    try {
      setLoading(true);
      await apiService.uploadImage(file, name, folderId);
      
      // Refresh images list for the current folder
      await getImages(folderId);
    } catch (error: any) {
      console.error('Upload image error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to upload image'
      );
    } finally {
      setLoading(false);
    }
  }, [getImages]);

  const searchImages = useCallback(async (
    query: string,
    folderId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.searchImages(query, folderId, page, limit);
      setImages(response.images);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Search images error:', error);
      setImages([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateImage = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.updateImage(id, name);
      
      // Update the image in the current list
      setImages(prev => 
        prev.map(img => 
          img._id === id ? response.image : img
        )
      );
    } catch (error: any) {
      console.error('Update image error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update image'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteImage = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await apiService.deleteImage(id);
      
      // Remove the image from the current list
      setImages(prev => prev.filter(img => img._id !== id));
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        pages: Math.ceil((prev.total - 1) / prev.limit)
      }));
    } catch (error: any) {
      console.error('Delete image error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete image'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const moveImage = useCallback(async (id: string, folderId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.moveImage(id, folderId);
      
      // Update the image in the current list
      setImages(prev => 
        prev.map(img => 
          img._id === id ? response.image : img
        )
      );
    } catch (error: any) {
      console.error('Move image error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to move image'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const value: ImageContextType = {
    images,
    uploadImage,
    getImages,
    searchImages,
    updateImage,
    deleteImage,
    moveImage,
    loading,
    pagination,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};
