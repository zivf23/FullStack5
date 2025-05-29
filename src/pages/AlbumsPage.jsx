// src/pages/AlbumsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; // Link pourrait être utilisé plus tard pour la vue d'un album individuel
import { useAuth } from '../App';
import { getAlbumsByUserId, getPhotosByAlbumId } from '../apiService'; // En supposant que ces fonctions existent

// Composant interne pour afficher un album individuel
function AlbumListItem({ album, onViewPhotos }) {
  return (
    <div className="album-list-item">
      <h3 className="album-item-title">{album.title}</h3>
      {/* Ici, on peut ajouter la première miniature de l'album si on le souhaite */}
      <button onClick={() => onViewPhotos(album.id)} className="button button-outline">
        הצג תמונות
      </button>
    </div>
  );
}

// Composant interne pour afficher les photos d'un album
function PhotoGridView({ photos, albumTitle, onClose }) {
    if (!photos || photos.length === 0) {
        return (
            <div className="photo-grid-view">
                 <button onClick={onClose} className="button button-secondary close-button">חזור לרשימת אלבומים</button>
                <h2 className="album-detail-title">תמונות באלבום: {albumTitle}</h2>
                <p className="info-text">אין תמונות להצגה באלבום זה.</p>
            </div>
        );
    }

    return (
        <div className="photo-grid-view">
            <button onClick={onClose} className="button button-secondary close-button">חזור לרשימת אלבומים</button>
            <h2 className="album-detail-title">תמונות באלבום: {albumTitle}</h2>
            <div className="photo-grid">
                {photos.map(photo => (
                    <div key={photo.id} className="photo-grid-item">
                        <img src={photo.thumbnailUrl} alt={photo.title} className="photo-thumbnail" />
                        <p className="photo-title">{photo.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function AlbumsPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null); // Pour le titre de l'album
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlbums = useCallback(async () => {
    if (user && userId === user.id.toString()) {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlbumsByUserId(user.id);
        setAlbums(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (user && userId !== user.id.toString()) {
        setError("אין לך הרשאה לצפות באלבומים אלו.");
        setLoading(false);
        setAlbums([]);
    }
  }, [user, userId]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleViewPhotos = async (albumId) => {
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
    setSelectedAlbum(null);
    setPhotos([]);
  };

  if (loading && !selectedAlbum) return <div className="loading-text">טוען אלבומים...</div>;
  if (error && !albums.length && (!user || userId !== user.id.toString())) return <div className="error-text">שגיאה: {error}</div>;
  if (!user) return <div className="info-text">אנא התחבר כדי לראות את האלבומים שלך.</div>;
  if (error && userId !== user.id.toString()) return <div className="error-text">שגיאה: {error}</div>;

  return (
    <div className="albums-page-container">
      <h1 className="page-title">האלבומים שלי</h1>
      {error && !selectedAlbum && <p className="error-text page-error-message">{error}</p>}

      {selectedAlbum ? (
        <PhotoGridView 
            photos={photos} 
            albumTitle={selectedAlbum.title} 
            onClose={handleClosePhotos} 
        />
      ) : (
        albums.length === 0 && !loading ? (
          <p className="info-text">אין לך אלבומים כרגע.</p>
        ) : (
          <div className="album-list-container">
            {albums.map(album => (
              <AlbumListItem key={album.id} album={album} onViewPhotos={handleViewPhotos} />
            ))}
          </div>
        )
      )}
      {loadingPhotos && <div className="loading-text">טוען תמונות...</div>}
    </div>
  );
}

