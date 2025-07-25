import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Folder, FolderContextType } from '../types';
import { apiService } from '../services/api';

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const useFolder = (): FolderContextType => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolder must be used within a FolderProvider');
  }
  return context;
};

interface FolderProviderProps {
  children: ReactNode;
}

export const FolderProvider: React.FC<FolderProviderProps> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folderTree, setFolderTree] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);

  const getFolders = useCallback(async (parentFolder?: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.getFolders(parentFolder);
      setFolders(response.folders);
    } catch (error: any) {
      console.error('Get folders error:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFolderTree = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.getFolderTree();
      setFolderTree(response.folderTree);
    } catch (error: any) {
      console.error('Get folder tree error:', error);
      setFolderTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFolder = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.getFolder(id);
      setCurrentFolder(response.folder);
    } catch (error: any) {
      console.error('Get folder error:', error);
      setCurrentFolder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name: string, parentFolder?: string): Promise<void> => {
    try {
      setLoading(true);
      await apiService.createFolder(name, parentFolder);
      
      // Update folders list
      await getFolders(parentFolder);
      await getFolderTree();
    } catch (error: any) {
      console.error('Create folder error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to create folder'
      );
    } finally {
      setLoading(false);
    }
  }, [getFolders, getFolderTree]);

  const updateFolder = async (id: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.updateFolder(id, name);
      
      // Update current folder if it's the one being updated
      if (currentFolder && currentFolder._id === id) {
        setCurrentFolder(response.folder);
      }
      
      // Update folders list and tree
      await getFolders(currentFolder?.parentFolder);
      await getFolderTree();
    } catch (error: any) {
      console.error('Update folder error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update folder'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await apiService.deleteFolder(id);
      
      // Clear current folder if it's the one being deleted
      if (currentFolder && currentFolder._id === id) {
        setCurrentFolder(null);
      }
      
      // Update folders list and tree
      await getFolders(currentFolder?.parentFolder);
      await getFolderTree();
    } catch (error: any) {
      console.error('Delete folder error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete folder'
      );
    } finally {
      setLoading(false);
    }
  };

  const value: FolderContextType = {
    folders,
    currentFolder,
    folderTree,
    createFolder,
    getFolders,
    getFolderTree,
    getFolder,
    updateFolder,
    deleteFolder,
    loading,
  };

  return <FolderContext.Provider value={value}>{children}</FolderContext.Provider>;
};
