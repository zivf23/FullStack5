// src/pages/AlbumsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; // Link pourrait être utilisé plus tard pour la vue d'un album individuel
import { useAuth } from '../App';
import { getAlbumsByUserId, getPhotosByAlbumId,createAlbum,addPhotoToAlbum,updatePhoto,deletePhoto } from '../apiService'; // En supposant que ces fonctions existent

// Composant interne pour afficher un album individuel
function AlbumListItem({ album, onViewPhotos }) {
  return (
    <div className="album-list-item">
      <h3 className="album-item-title">{album.title}</h3>
      <p className="album-item-id">ID: {album.id}</p> {/* Ajout de l'ID de l'album */}
      {/* Ici, on peut ajouter la première miniature de l'album si on le souhaite */}
      <button onClick={() => onViewPhotos(album.id)} className="button button-outline">
        הצג תמונות
      </button>
    </div>
  );
}

// Composant interne pour afficher les photos d'un album
function PhotoGridView({ photos, albumTitle, onClose, onAddPhoto, onUpdatePhoto, onDeletePhoto }) {
  const [newPhotoTitleAdd, setNewPhotoTitleAdd] = useState('');
  const [newPhotoUrlAdd, setNewPhotoUrlAdd] = useState('');
  const [newPhotoTitleUpdate, setNewPhotoTitleUpdate] = useState('');
  const [newPhotoUrlUpdate, setNewPhotoUrlUpdate] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [photosPerPage] = useState(10); // Nombre de photos par page

  // Calculer l'index de la première et de la dernière photo sur la page actuelle
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  const totalPages = Math.ceil(photos.length / photosPerPage);

  const handleAddPhoto = async () => {
    try {
      if (!newPhotoTitleAdd.trim() || !newPhotoUrlAdd.trim()) {
        alert('Please fill all fields');
        return;
      }
      await onAddPhoto(newPhotoTitleAdd, newPhotoUrlAdd);
      setNewPhotoTitleAdd('');
      setNewPhotoUrlAdd('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdatePhoto = async () => {
    try {
      if (!selectedPhoto || !newPhotoTitleUpdate.trim() || !newPhotoUrlUpdate.trim()) {
        alert('Please fill all fields and select a photo');
        return;
      }
      await onUpdatePhoto(selectedPhoto.id, newPhotoTitleUpdate, newPhotoUrlUpdate);
      setSelectedPhoto(null);
      setNewPhotoTitleUpdate('');
      setNewPhotoUrlUpdate('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this photo?')) {
        await onDeletePhoto(id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when photos change
  }, [photos]);

  return (
    <div className="photo-grid-view">
      <button onClick={onClose} className="button button-secondary close-button">חזור לרשימת אלבומים</button>
      <h2 className="album-detail-title">תמונות באלבום: {albumTitle}</h2>

      {/* Add Photo Form */}
      <h3>Add New Photo</h3>
      <div className="form-group">
        <label htmlFor="newPhotoTitleAdd">Photo Title:</label>
        <input
          type="text"
          id="newPhotoTitleAdd"
          placeholder="Enter photo title"
          className="form-input"
          value={newPhotoTitleAdd}
          onChange={(e) => setNewPhotoTitleAdd(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPhotoUrlAdd">Photo URL:</label>
        <input
          type="text"
          id="newPhotoUrlAdd"
          placeholder="Enter photo URL"
          className="form-input"
          value={newPhotoUrlAdd}
          onChange={(e) => setNewPhotoUrlAdd(e.target.value)}
        />
      </div>
      <button onClick={handleAddPhoto} className="button button-primary">Add Photo</button>

      {/* Update Photo Form */}
      <h3>Update Selected Photo</h3>
      <div className="form-group">
        <label htmlFor="newPhotoTitleUpdate">New Photo Title:</label>
        <input
          type="text"
          id="newPhotoTitleUpdate"
          placeholder="Enter new photo title"
          className="form-input"
          value={newPhotoTitleUpdate}
          onChange={(e) => setNewPhotoTitleUpdate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPhotoUrlUpdate">New Photo URL:</label>
        <input
          type="text"
          id="newPhotoUrlUpdate"
          placeholder="Enter new photo URL"
          className="form-input"
          value={newPhotoUrlUpdate}
          onChange={(e) => setNewPhotoUrlUpdate(e.target.value)}
        />
      </div>
      <button onClick={handleUpdatePhoto} className="button button-primary">Update Photo</button>

      <div className="photo-grid">
        {currentPhotos.map(photo => (
          <div key={photo.id} className="photo-grid-item">
            <img src={photo.thumbnailUrl} alt={photo.title} className="photo-thumbnail" onClick={() => {
              setSelectedPhoto(photo);
              setNewPhotoTitleUpdate(photo.title);
              setNewPhotoUrlUpdate(photo.url);
            }} />
            <p className="photo-title">{photo.title}</p>
            <button onClick={() => handleDeletePhoto(photo.id)} className="button button-outline">Delete</button>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="button button-secondary">
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="button button-primary">
          Next
        </button>
      </div>
    </div>
  );
}

export default function AlbumsPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // État pour le terme de recherche
  const [filteredAlbums, setFilteredAlbums] = useState([]); // État pour les albums filtrés
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // État pour afficher ou non la barre de recherche
  const [newAlbumTitle, setNewAlbumTitle] = useState(''); // État pour le titre du nouvel album
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false); // État pour indiquer si un album est en cours de création
  const [showCreateAlbum, setShowCreateAlbum] = useState(true); // État pour afficher ou non la barre de création d'album

  const fetchAlbums = useCallback(async () => {
    if (user && userId === user.id.toString()) {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlbumsByUserId(user.id);
        setAlbums(data);
        setFilteredAlbums(data); // Initialiser les albums filtrés avec tous les albums
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (user && userId !== user.id.toString()) {
      setError("אין לך הרשאה לצפות באלבומים אלו.");
      setLoading(false);
      setAlbums([]);
      setFilteredAlbums([]); // Initialiser les albums filtrés avec un tableau vide
    }
  }, [user, userId]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  useEffect(() => {
    // Filtrer les albums en fonction du terme de recherche
    if (searchTerm) {
      const filtered = albums.filter(album =>
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.id.toString().includes(searchTerm)
      );
      setFilteredAlbums(filtered);
    } else {
      setFilteredAlbums(albums);
    }
  }, [searchTerm, albums]);

  const handleViewPhotos = async (albumId) => {
    setShowSearch(false); // Cacher la barre de recherche
    setShowCreateAlbum(false); // Cacher la barre de création d'album
    const album = albums.find(a => a.id === albumId);
    if (!album) return;

    setSelectedAlbum(album);
    setLoadingPhotos(true);
    setError(null);
    try {
      const photosData = await getPhotosByAlbumId(albumId);
      setPhotos(photosData);
    } catch (err) {
      setError(err.message);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleClosePhotos = () => {
    setShowSearch(true); // Afficher la barre de recherche
    setShowCreateAlbum(true); // Afficher la barre de création d'album
    setSelectedAlbum(null);
    setPhotos([]);
  };

  const handleCreateAlbum = async () => {
    setIsCreatingAlbum(true);
    setError(null);
    try {
      // Validation simple du titre
      if (!newAlbumTitle.trim()) {
        setError("הכותרת של האלבום לא יכולה להיות ריקה.");
        return;
      }

      // Créer l'album via l'API
      const newAlbum = await createAlbum(user.id, newAlbumTitle);

      // Mettre à jour l'état avec le nouvel album
      setAlbums([...albums, newAlbum]);
      setFilteredAlbums([...filteredAlbums, newAlbum]);

      // Réinitialiser le titre du nouvel album
      setNewAlbumTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  if (loading && !selectedAlbum) return <div className="loading-text">טוען אלבומים...</div>;
  if (error && !albums.length && (!user || userId !== user.id.toString())) return <div className="error-text">שגיאה: {error}</div>;
  if (!user) return <div className="info-text">אנא התחבר כדי לראות את האלבומים שלך.</div>;
  if (error && userId !== user.id.toString()) return <div className="error-text">שגיאה: {error}</div>;

const handleAddPhoto = async (title, url) => {
  setLoadingPhotos(true);
  setError(null);
  try {
    const newPhoto = await addPhotoToAlbum(selectedAlbum.id, title, url, url); // Copier l'URL dans thumbnailUrl
    setPhotos([...photos, newPhoto]);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoadingPhotos(false);
  }
};

const handleUpdatePhoto = async (id, title, url) => {
  setLoadingPhotos(true);
  setError(null);
  try {
    await updatePhoto(id, title, url, url); // Copier l'URL dans thumbnailUrl
    setPhotos(photos.map(photo => photo.id === id ? { ...photo, title, url, thumbnailUrl: url } : photo));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoadingPhotos(false);
  }
};

const handleDeletePhoto = async (id) => {
  setLoadingPhotos(true);
  setError(null);
  try {
    await deletePhoto(id);
    setPhotos(photos.filter(photo => photo.id !== id));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoadingPhotos(false);
  }
};

return (
  <div className="albums-page-container">
    <h1 className="page-title">האלבומים שלי</h1>

    {/* Champ de recherche */}
    {showSearch && (
      <input
        type="text"
        placeholder="חפש אלבום לפי כותרת או מזהה..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    )}

    {/* Formulaire de création d'album */}
    {showCreateAlbum && (
      <div className="create-album-form">
        <input
          type="text"
          placeholder="שם האלבום החדש..."
          className="new-album-input"
          value={newAlbumTitle}
          onChange={(e) => setNewAlbumTitle(e.target.value)}
        />
        <button onClick={handleCreateAlbum} className="button button-primary" disabled={isCreatingAlbum}>
          {isCreatingAlbum ? "יוצר אלבום..." : "צור אלבום"}
        </button>
      </div>
    )}

    {error && !selectedAlbum && <p className="error-text page-error-message">{error}</p>}

    {selectedAlbum ? (
      <PhotoGridView
        photos={photos}
        albumTitle={selectedAlbum.title}
        onClose={handleClosePhotos}
        onAddPhoto={handleAddPhoto}
        onUpdatePhoto={handleUpdatePhoto}
        onDeletePhoto={handleDeletePhoto}
      />
    ) : (
      filteredAlbums.length === 0 && !loading ? (
        <p className="info-text">אין לך אלבומים כרגע.</p>
      ) : (
        <div className="album-list-container">
          {filteredAlbums.map(album => (
            <AlbumListItem key={album.id} album={album} onViewPhotos={handleViewPhotos} />
          ))}
        </div>
      )
    )}
    {loadingPhotos && <div className="loading-text">טוען תמונות...</div>}
  </div>
);
}

