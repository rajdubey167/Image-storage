import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, User, Folder, Image, ApiError } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://image-cpii.onrender.com/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/signup', {
      username,
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Folder endpoints
  async createFolder(name: string, parentFolder?: string): Promise<{ message: string; folder: Folder }> {
    const response = await this.api.post('/folders', { name, parentFolder });
    return response.data;
  }

  async getFolders(parentFolder?: string): Promise<{ folders: Folder[] }> {
    const params = parentFolder ? { parentFolder } : {};
    const response = await this.api.get('/folders', { params });
    return response.data;
  }

  async getFolderTree(): Promise<{ folderTree: Folder[] }> {
    const response = await this.api.get('/folders/tree');
    return response.data;
  }

  async getFolder(id: string): Promise<{ folder: Folder }> {
    const response = await this.api.get(`/folders/${id}`);
    return response.data;
  }

  async updateFolder(id: string, name: string): Promise<{ message: string; folder: Folder }> {
    const response = await this.api.put(`/folders/${id}`, { name });
    return response.data;
  }

  async deleteFolder(id: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/folders/${id}`);
    return response.data;
  }

  // Image endpoints
  async uploadImage(file: File, name: string, folderId: string): Promise<{ message: string; image: Image }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('folderId', folderId);

    const response = await this.api.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getImages(folderId?: string, page: number = 1, limit: number = 20): Promise<{
    images: Image[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params: any = { page, limit };
    if (folderId) {
      params.folderId = folderId;
    }
    
    const response = await this.api.get('/images', {
      params,
    });
    return response.data;
  }

  async searchImages(query: string, folderId?: string, page: number = 1, limit: number = 20): Promise<{
    images: Image[];
    query: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params: any = { query, page, limit };
    if (folderId) {
      params.folderId = folderId;
    }

    const response = await this.api.get('/images/search', { params });
    return response.data;
  }

  async getImage(id: string): Promise<{ image: Image }> {
    const response = await this.api.get(`/images/${id}`);
    return response.data;
  }

  async updateImage(id: string, name: string): Promise<{ message: string; image: Image }> {
    const response = await this.api.put(`/images/${id}`, { name });
    return response.data;
  }

  async deleteImage(id: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/images/${id}`);
    return response.data;
  }

  async moveImage(id: string, folderId: string): Promise<{ message: string; image: Image }> {
    const response = await this.api.post(`/images/${id}/move`, { folderId });
    return response.data;
  }

  // Utility method to get full image URL
  getImageUrl(filename: string): string {
    return `${API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
  }
}

export const apiService = new ApiService();
export default apiService;
