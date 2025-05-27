import React, { useEffect, useState } from 'react';

const FormForPOSTs = ({ activeUserId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/posts?userId=${activeUserId}`)
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('Erreur de chargement des posts:', error));
  }, [activeUserId]);

  return (
    <div>
      <h2>Posts de l'utilisateur {activeUserId}</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <strong>ID:</strong> {post.id} | <strong>Titre:</strong> {post.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormForPOSTs;
