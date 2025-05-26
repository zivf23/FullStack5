import fs from 'fs';

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const ENDPOINTS = ['users', 'posts', 'comments', 'albums', 'photos', 'todos'];
const NEW_IMAGE_URL = (id) => `https://picsum.photos/id/${id % 100}/600/400`;

async function fetchAll() {
  const result = {};

  for (const endpoint of ENDPOINTS) {
    const res = await fetch(`${BASE_URL}/${endpoint}`);
    let json = await res.json();

    if (endpoint === 'photos') {
      json = json.map(photo => ({
        ...photo,
        url: NEW_IMAGE_URL(photo.id),
        thumbnailUrl: NEW_IMAGE_URL(photo.id)
      }));
    }

    result[endpoint] = json;
    console.log(`✅ Données récupérées : ${endpoint}`);
  }

  fs.writeFileSync('./db.json', JSON.stringify(result, null, 2));
  console.log('🎉 Fichier db.json généré avec succès');
}

fetchAll().catch(err => console.error('❌ Erreur :', err));
