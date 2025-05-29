// src/apiService.js (או apiService.jsx)

const BASE_URL = 'http://localhost:3001'; 

// ... (פונקציות קיימות כמו getUserByUsername, registerUser, וכו' נשארות) ...

// --- User API ---
export async function getUserByUsername(username) {
  const response = await fetch(`${BASE_URL}/users?username=${username}`);
  if (!response.ok) {
    throw new Error(`שגיאת רשת: ${response.status} - ${response.statusText}`);
  }
  return response.json();
}

export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'שגיאה לא ידועה ברישום משתמש' }));
    throw new Error(errorData.message || `שגיאה ברישום: ${response.status}`);
  }
  return response.json();
}

export async function getUserById(userId) {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    if (!response.ok) {
        throw new Error(`שגיאת רשת בטעינת פרטי משתמש: ${response.status}`);
    }
    return response.json();
}


// --- Todos API ---
export async function getTodosByUserId(userId) {
  const response = await fetch(`${BASE_URL}/todos?userId=${userId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת משימות');
  return response.json();
}

export async function addTodo(todoData) {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData),
  });
  if (!response.ok) throw new Error('שגיאה בהוספת משימה');
  return response.json();
}

export async function updateTodo(todoId, updatedData) {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) throw new Error('שגיאה בעדכון משימה');
  return response.json();
}

export async function deleteTodo(todoId) {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('שגיאה במחיקת משימה');
  return response.json(); 
}

// --- Posts API ---
export async function getAllPosts() { // <-- פונקציה חדשה
  const response = await fetch(`${BASE_URL}/posts`);
  if (!response.ok) throw new Error('שגיאה בטעינת כל הפוסטים');
  return response.json();
}

export async function getPostsByUserId(userId) { // נשאיר אותה אם נרצה בעתיד "הפוסטים שלי"
  const response = await fetch(`${BASE_URL}/posts?userId=${userId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת פוסטים של משתמש');
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

// --- Comments API ---
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

export async function updateComment(commentId, commentData) { // <-- פונקציה חדשה לעדכון תגובה
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });
  if (!response.ok) throw new Error('שגיאה בעדכון תגובה');
  return response.json();
}

export async function deleteComment(commentId) { // <-- פונקציה חדשה למחיקת תגובה
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('שגיאה במחיקת תגובה');
  return response.json();
}


// --- Albums API ---
export async function getAlbumsByUserId(userId) {
  const response = await fetch(`${BASE_URL}/albums?userId=${userId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת אלבומים');
  return response.json();
}

// --- Photos API ---
export async function getPhotosByAlbumId(albumId) {
  const response = await fetch(`${BASE_URL}/photos?albumId=${albumId}`);
  if (!response.ok) throw new Error('שגיאה בטעינת תמונות');
  return response.json();
}


