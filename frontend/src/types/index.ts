export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Folder {
  _id: string;
  name: string;
  userId: string;
  parentFolder?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  subfolders?: Folder[];
  images?: Image[];
}

export interface Image {
  _id: string;
  name: string;
  originalName: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  userId: string;
  folderId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface FolderContextType {
  folders: Folder[];
  currentFolder: Folder | null;
  folderTree: Folder[];
  createFolder: (name: string, parentFolder?: string) => Promise<void>;
  getFolders: (parentFolder?: string) => Promise<void>;
  getFolderTree: () => Promise<void>;
  getFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  loading: boolean;
}

export interface ImageContextType {
  images: Image[];
  uploadImage: (file: File, name: string, folderId: string) => Promise<void>;
  getImages: (folderId?: string, page?: number, limit?: number) => Promise<void>;
  searchImages: (query: string, folderId?: string, page?: number, limit?: number) => Promise<void>;
  updateImage: (id: string, name: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  moveImage: (id: string, folderId: string) => Promise<void>;
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
