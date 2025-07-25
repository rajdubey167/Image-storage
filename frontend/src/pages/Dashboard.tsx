import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiFolder, FiUpload, FiSearch, FiLogOut, FiUser, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useFolder } from '../contexts/FolderContext';
import { useImage } from '../contexts/ImageContext';
import { apiService } from '../services/api';

const DashboardContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.h1`
  color: #667eea;
  font-size: 1.5rem;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const FolderTree = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const FolderItem = styled.div<{ $level: number; $selected?: boolean }>`
  padding: 8px 12px;
  margin-left: ${props => props.$level * 20}px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 5px;
  background: ${props => props.$selected ? '#f0f2ff' : 'transparent'};
  color: ${props => props.$selected ? '#667eea' : '#333'};
  position: relative;
  
  &:hover {
    background: #f0f2ff;
  }
  
  &:hover .delete-button {
    opacity: 1;
  }
`;

const FolderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const DeleteButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    background: #dc3545;
    color: white;
    transform: scale(1.1);
  }
`;

const ItemCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  &:hover .item-actions,
  &:hover .image-actions {
    opacity: 1; /* Show delete button on hover */
  }
`;

const ItemActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0; /* Initially hidden */
  transition: opacity 0.2s;
  pointer-events: none; /* Prevent interaction when hidden */

  ${ItemCard}:hover & {
    opacity: 1; /* Visible on hover */
    pointer-events: auto; /* Enable interaction */
  }
`;

const ImageActions = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 0; /* Initially hidden */
  transition: opacity 0.2s;
  pointer-events: none; /* Prevent interaction when hidden */

  ${ItemCard}:hover & {
    opacity: 1; /* Visible on hover */
    pointer-events: auto; /* Enable interaction */
  }
`;

const ImageDeleteButton = styled.button`
  background: #dc3545; /* Red background for better visibility */
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  opacity: 1; /* Always visible */
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
  
  &:hover {
    background: #c82333;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 25px;
  padding: 10px 20px;
  gap: 10px;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  flex: 1;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#667eea'};
  border: 1px solid #667eea;
  padding: 10px 16px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
`;

const BreadcrumbItem = styled.span<{ $clickable?: boolean }>`
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  color: ${props => props.$clickable ? '#667eea' : '#666'};
  
  &:hover {
    text-decoration: ${props => props.$clickable ? 'underline' : 'none'};
  }
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
  color: white;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const AuthButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$variant === 'primary' ? 'white' : 'transparent'};
  color: ${props => props.$variant === 'primary' ? '#667eea' : 'white'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    background: ${props => props.$variant === 'primary' ? '#f8f9ff' : 'white'};
    color: #667eea;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const ItemIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 12px;
  text-align: center;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 8px;
  word-break: break-word;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #999;
  text-align: center;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 12px;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { folderTree, currentFolder, getFolderTree, getFolder, createFolder, deleteFolder } = useFolder();
  const { images, getImages, uploadImage, searchImages, deleteImage } = useImage();
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeFolders = async () => {
      if (!user) return; // Don't load folders if user is not authenticated
      try {
        await getFolderTree();
      } catch (error) {
        console.error('Failed to load folder tree:', error);
      }
    };
    initializeFolders();
  }, [getFolderTree, user]);

  useEffect(() => {
    const loadFolderData = async () => {
      if (!user || !selectedFolderId) return; // Don't load folder data if user is not authenticated
      try {
        await getFolder(selectedFolderId);
        await getImages(selectedFolderId);
      } catch (error) {
        console.error('Failed to load folder data:', error);
      }
    };
    loadFolderData();
  }, [selectedFolderId, getFolder, getImages, user]);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setLoading(true);
      await createFolder(newFolderName, selectedFolderId || undefined);
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newImageName.trim() || !selectedFolderId) return;

    try {
      setLoading(true);
      await uploadImage(selectedFile, newImageName, selectedFolderId);
      setNewImageName('');
      setSelectedFile(null);
      setShowUploadImage(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await searchImages(searchQuery, selectedFolderId || undefined);
      } catch (error: any) {
        alert(error.message);
      }
    } else if (selectedFolderId) {
      getImages(selectedFolderId);
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents? This action cannot be undone.`)) {
      try {
        await deleteFolder(folderId);
        // If the deleted folder was selected, reset selection
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null);
        }
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleDeleteImage = async (imageId: string, imageName: string) => {
    if (window.confirm(`Are you sure you want to delete the image "${imageName}"? This action cannot be undone.`)) {
      try {
        await deleteImage(imageId);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const renderFolderTree = (folders: any[], level = 0) => {
    return folders.map(folder => (
      <div key={folder._id}>
        <FolderItem
          $level={level}
          $selected={selectedFolderId === folder._id}
        >
          <FolderContent onClick={() => handleFolderClick(folder._id)}>
            <FiFolder />
            {folder.name}
          </FolderContent>
          <DeleteButton 
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(folder._id, folder.name);
            }}
            title="Delete folder"
          >
            <FiTrash2 />
          </DeleteButton>
        </FolderItem>
        {folder.subfolders && folder.subfolders.length > 0 && (
          renderFolderTree(folder.subfolders, level + 1)
        )}
      </div>
    ));
  };

  // If user is not logged in, show welcome screen
  if (!user) {
    return (
      <WelcomeContainer>
        <WelcomeTitle>Welcome to ImageStore</WelcomeTitle>
        <WelcomeSubtitle>
          Organize and manage your images with ease. Create folders, upload images, and keep everything organized.
        </WelcomeSubtitle>
        <AuthButtons>
          <AuthButton $variant="primary" onClick={() => navigate('/login')}>
            <FiUser style={{ marginRight: '8px' }} />
            Login
          </AuthButton>
          <AuthButton onClick={() => navigate('/signup')}>
            <FiPlus style={{ marginRight: '8px' }} />
            Sign Up
          </AuthButton>
        </AuthButtons>
      </WelcomeContainer>
    );
  }

  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarHeader>
          <Logo>ImageStore</Logo>
          <UserInfo>
            <FiUser />
            {user?.username}
          </UserInfo>
        </SidebarHeader>
        <FolderTree>
          <FolderItem $level={0} $selected={!selectedFolderId} onClick={() => setSelectedFolderId(null)}>
            <FiFolder />
            All Folders
          </FolderItem>
          {renderFolderTree(folderTree)}
        </FolderTree>
      </Sidebar>

      <MainContent>
        <TopBar>
          <SearchBar>
            <FiSearch />
            <SearchInput
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </SearchBar>
          <ActionButtons>
            <Button onClick={() => setShowCreateFolder(true)}>
              <FiPlus />
              New Folder
            </Button>
            <Button 
              $variant="primary" 
              onClick={() => setShowUploadImage(true)}
              disabled={!selectedFolderId}
            >
              <FiUpload />
              Upload Image
            </Button>
            <Button onClick={logout}>
              <FiLogOut />
              Logout
            </Button>
          </ActionButtons>
        </TopBar>

        <ContentArea>
          <Breadcrumb>
            <BreadcrumbItem $clickable onClick={() => setSelectedFolderId(null)}>
              Home
            </BreadcrumbItem>
            {currentFolder && (
              <>
                <span>/</span>
                <BreadcrumbItem>{currentFolder.name}</BreadcrumbItem>
              </>
            )}
          </Breadcrumb>

          <GridContainer>
            {currentFolder?.subfolders?.map(folder => (
              <ItemCard key={folder._id}>
                <div onClick={() => handleFolderClick(folder._id)}>
                  <ItemIcon>
                    <FiFolder />
                  </ItemIcon>
                  <ItemName>{folder.name}</ItemName>
                  <ItemMeta>Folder</ItemMeta>
                </div>
                <ItemActions className="item-actions">
                  <DeleteButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder._id, folder.name);
                    }}
                    title="Delete folder"
                  >
                    <FiTrash2 />
                  </DeleteButton>
                </ItemActions>
              </ItemCard>
            ))}
            
            {images.map(image => (
              <ItemCard key={image._id}>
                <ImagePreview 
                  src={apiService.getImageUrl(image.filename)} 
                  alt={image.name}
                />
                <ItemName>{image.name}</ItemName>
                <ItemMeta>{(image.size / 1024 / 1024).toFixed(2)} MB</ItemMeta>
                <ImageActions className="image-actions">
                  <ImageDeleteButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image._id, image.name);
                    }}
                    title="Delete image"
                  >
                    <FiTrash2 />
                  </ImageDeleteButton>
                </ImageActions>
              </ItemCard>
            ))}
          </GridContainer>
        </ContentArea>
      </MainContent>

      {/* Create Folder Modal */}
      <Modal $show={showCreateFolder}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create New Folder</ModalTitle>
            <CloseButton onClick={() => setShowCreateFolder(false)}>×</CloseButton>
          </ModalHeader>
          <form onSubmit={handleCreateFolder}>
            <FormGroup>
              <Label>Folder Name</Label>
              <Input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                required
              />
            </FormGroup>
            <ActionButtons>
              <Button type="button" onClick={() => setShowCreateFolder(false)}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Folder'}
              </Button>
            </ActionButtons>
          </form>
        </ModalContent>
      </Modal>

      {/* Upload Image Modal */}
      <Modal $show={showUploadImage}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Upload Image</ModalTitle>
            <CloseButton onClick={() => setShowUploadImage(false)}>×</CloseButton>
          </ModalHeader>
          <form onSubmit={handleUploadImage}>
            <FormGroup>
              <Label>Image Name</Label>
              <Input
                type="text"
                value={newImageName}
                onChange={(e) => setNewImageName(e.target.value)}
                placeholder="Enter image name"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Select Image</Label>
              <FileInput
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
              />
            </FormGroup>
            <ActionButtons>
              <Button type="button" onClick={() => setShowUploadImage(false)}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={loading || !selectedFolderId}>
                {loading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </ActionButtons>
          </form>
        </ModalContent>
      </Modal>
    </DashboardContainer>
  );
};

export default Dashboard;
