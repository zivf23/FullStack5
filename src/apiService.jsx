// src/apiService.js

// הגדרת כתובת הבסיס של השרת שלנו (json-server).
// חשוב לוודא שהפורט (3001) תואם לפורט שבו אתה מריץ את json-server.
const BASE_URL = 'http://localhost:3001';

/**
 * פונקציה אסינכרונית היא פונקציה שתמיד מחזירה Promise.
 * השימוש ב-await בתוך פונקציה אסינכרונית "עוצר" את ריצת הפונקציה
 * עד שה-Promise שלידו (במקרה זה, התגובה מ-fetch) נפתר (חוזרת תשובה מהשרת).
 */

// --- פונקציות שירות עבור משאב 'users' ---

/**
 * שליפת משתמש לפי שם משתמש.
 * @param {string} username - שם המשתמש לחיפוש.
 * @returns {Promise<Array>} Promise שמכיל מערך של משתמשים תואמים (בדרך כלל אחד או אפס).
 */
export async function getUserByUsername(username) {
  // מבצעים קריאת GET לשרת, לנקודת הקצה /users, עם פרמטר חיפוש username.
  // `Workspace` מחזיר Promise.
  const response = await fetch(`${BASE_URL}/users?username=${username}`);
  
  // בודקים אם התגובה מהשרת הייתה מוצלחת (סטטוס HTTP בטווח 200-299).
  if (!response.ok) {
    // אם לא, זורקים שגיאה עם מידע על הבעיה.
    throw new Error(`שגיאת רשת: ${response.status} - ${response.statusText}`);
  }
  // אם התגובה מוצלחת, ממירים את גוף התגובה מ-JSON לאובייקט JavaScript.
  // response.json() גם הוא מחזיר Promise.
  return response.json();
}

/**
 * רישום משתמש חדש.
 * @param {object} userData - אובייקט עם פרטי המשתמש החדש.
 * @returns {Promise<object>} Promise שמכיל את אובייקט המשתמש שנוצר (כולל ID מהשרת).
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST', // מגדירים את שיטת ה-HTTP ל-POST ליצירת משאב חדש.
    headers: {
      'Content-Type': 'application/json', // מציינים שהגוף של הבקשה הוא בפורמט JSON.
    },
    body: JSON.stringify(userData), // ממירים את אובייקט הנתונים למחרוזת JSON.
  });
  if (!response.ok) {
    // ננסה לקרוא את גוף השגיאה מהשרת אם קיים
    const errorData = await response.json().catch(() => ({ message: 'שגיאה לא ידועה ברישום משתמש' }));
    throw new Error(errorData.message || `שגיאה ברישום: ${response.status}`);
  }
  return response.json();
}

/**
 * שליפת משתמש לפי ID.
 * @param {string|number} userId - ה-ID של המשתמש.
 * @returns {Promise<object>} Promise שמכיל את אובייקט המשתמש.
 */
export async function getUserById(userId) {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    if (!response.ok) {
        throw new Error(`שגיאת רשת בטעינת פרטי משתמש: ${response.status}`);
    }
    return response.json();
}


// --- פונקציות שירות עבור משאב 'todos' ---

/**
 * שליפת כל המשימות (todos) של משתמש ספציפי.
 * @param {string|number} userId - ה-ID של המשתמש.
 * @returns {Promise<Array>} Promise שמכיל מערך של משימות.
 */
export async function getTodosByUserId(userId) {
  const response = await fetch(`${BASE_URL}/todos?userId=${userId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת משימות');
  return response.json();
}

/**
 * הוספת משימה חדשה.
 * @param {object} todoData - אובייקט עם פרטי המשימה החדשה (כולל userId, title, completed).
 * @returns {Promise<object>} Promise שמכיל את אובייקט המשימה שנוצרה.
 */
export async function addTodo(todoData) {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData),
  });
  if (!response.ok) throw new Error('שגיאה בהוספת משימה');
  return response.json();
}

/**
 * עדכון משימה קיימת.
 * @param {string|number} todoId - ה-ID של המשימה לעדכון.
 * @param {object} updatedData - אובייקט עם הנתונים המעודכנים של המשימה.
 * @returns {Promise<object>} Promise שמכיל את אובייקט המשימה המעודכן.
 */
export async function updateTodo(todoId, updatedData) {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'PUT', // PUT מעדכן את כל האובייקט. אפשר להשתמש גם ב-PATCH לעדכון חלקי.
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) throw new Error('שגיאה בעדכון משימה');
  return response.json();
}

/**
 * מחיקת משימה.
 * @param {string|number} todoId - ה-ID של המשימה למחיקה.
 * @returns {Promise<object>} Promise (json-server מחזיר אובייקט ריק {} במחיקה מוצלחת).
 */
export async function deleteTodo(todoId) {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('שגיאה במחיקת משימה');
  return response.json(); 
}

// --- פונקציות שירות עבור משאב 'posts' ---
// (מבנה דומה לפונקציות של todos, מותאם לשדות של posts)

export async function getPostsByUserId(userId) {
  const response = await fetch(`${BASE_URL}/posts?userId=${userId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת פוסטים');
  return response.json();
}

export async function getPostById(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת פוסט');
  return response.json();
}

export async function addPost(postData) {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!response.ok) throw new Error('שגיאה בהוספת פוסט');
  return response.json();
}

export async function updatePost(postId, updatedData) {
  const response = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) throw new Error('שגיאה בעדכון פוסט');
  return response.json();
}

export async function deletePost(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('שגיאה במחיקת פוסט');
  return response.json();
}

// --- פונקציות שירות עבור משאב 'comments' ---
export async function getCommentsByPostId(postId) {
  const response = await fetch(`${BASE_URL}/comments?postId=${postId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת תגובות');
  return response.json();
}

export async function addComment(commentData) {
  const response = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });
  if (!response.ok) throw new Error('שגיאה בהוספת תגובה');
  return response.json();
}

export const createAlbum = async (userId, title) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/albums`, {
    method: 'POST',
    body: JSON.stringify({
      userId: userId,
      title: title,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to create album');
  }
  return await response.json();
};

// --- פונקציות שירות עבור משאב 'albums' ---
export async function getAlbumsByUserId(userId) {
  const response = await fetch(`${BASE_URL}/albums?userId=${userId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת אלבומים');
  return response.json();
}

// (כאן אפשר להוסיף פונקציות ל-addAlbum, updateAlbum, deleteAlbum אם נדרש בפרויקט)

// --- פונקציות שירות עבור משאב 'photos' ---
export async function getPhotosByAlbumId(albumId) {
  const response = await fetch(`${BASE_URL}/photos?albumId=${albumId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת תמונות');
  return response.json();
}

// (כאן אפשר להוסיף פונקציות ל-addPhoto, deletePhoto אם נדרש בפרויקט)
export const addPhotoToAlbum = async (albumId, title, url, thumbnailUrl) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/photos`, {
    method: 'POST',
    body: JSON.stringify({
      albumId: albumId,
      title: title,
      url: url,
      thumbnailUrl: thumbnailUrl,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to add photo');
  }
  return await response.json();
};

export const updatePhoto = async (id, title, url, thumbnailUrl) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: title,
      url: url,
      thumbnailUrl: thumbnailUrl,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to update photo');
  }
  return await response.json();
};

export const deletePhoto = async (id) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete photo');
  }
};
