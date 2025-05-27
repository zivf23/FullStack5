// src/pages/PostsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { getPostsByUserId, getCommentsByPostId, addPost, deletePost, addComment } from '../apiService';

// רכיב פנימי להצגת פוסט בודד ברשימה
function PostListItem({ post, onViewDetails }) {
  return (
    <div className="post-list-item">
      <h3 className="post-item-title">{post.title}</h3>
      <p className="post-item-excerpt">{post.body.substring(0, 100)}...</p>
      <button onClick={() => onViewDetails(post.id)} className="button button-outline">
        הצג פרטים ותגובות
      </button>
    </div>
  );
}

// רכיב פנימי להצגת פרטי פוסט מלאים ותגובות
function PostDetailView({ post, comments, onAddComment, onClose, currentUser }) {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      setCommentError("התגובה לא יכולה להיות ריקה.");
      return;
    }
    setCommentError('');
    
    const commentData = {
      postId: post.id,
      name: `תגובה מאת: ${currentUser.name || currentUser.username}`, // שימוש בשם המשתמש
      email: currentUser.email, // שימוש באימייל המשתמש
      body: newCommentText,
    };
    try {
      await onAddComment(commentData);
      setNewCommentText(''); // איפוס שדה התגובה
    } catch (error) {
      setCommentError(error.message || "שגיאה בהוספת תגובה");
    }
  };

  return (
    <div className="post-detail-view">
      <button onClick={onClose} className="button button-secondary close-button">סגור פרטים</button>
      <h2 className="post-detail-title">{post.title}</h2>
      <p className="post-detail-body">{post.body}</p>
      <hr className="section-divider" />
      <h3 className="comments-title">תגובות</h3>
      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map(comment => (
            <li key={comment.id} className="comment-item">
              <strong>{comment.name} ({comment.email}):</strong>
              <p>{comment.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="info-text">אין תגובות לפוסט זה עדיין.</p>
      )}
      <form onSubmit={handleCommentSubmit} className="add-comment-form">
        <h4>הוסף תגובה חדשה:</h4>
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="כתוב את תגובתך כאן..."
          rows="3"
          className="form-textarea"
        />
        {commentError && <p className="form-error-message">{commentError}</p>}
        <button type="submit" className="button button-primary">הוסף תגובה</button>
      </form>
    </div>
  );
}


export default function PostsPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);
  const [pageError, setPageError] = useState(null); // שגיאה ברמת העמוד
  const [formError, setFormError] = useState(null); // שגיאה ספציפית לטופס

  const [showAddPostForm, setShowAddPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');


  const fetchPosts = useCallback(async () => {
    if (user && userId === user.id.toString()) {
      setLoading(true);
      setPageError(null);
      try {
        const data = await getPostsByUserId(user.id);
        setPosts(data.sort((a, b) => b.id - a.id)); // מיון פוסטים מהחדש לישן
      } catch (err) {
        setPageError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (user && userId !== user.id.toString()) {
        setPageError("אין לך הרשאה לצפות בפוסטים אלו.");
        setLoading(false);
        setPosts([]);
    }
  }, [user, userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleViewDetails = async (postId) => {
    setLoadingComments(true);
    setPageError(null); 
    try {
      // משיכת הפוסט מהרשימה הקיימת כדי לחסוך קריאת API אם כבר יש לנו אותו
      const postData = posts.find(p => p.id === postId); 
      if (!postData) {
          throw new Error("הפוסט לא נמצא ברשימה."); // יכול לקרות אם הרשימה לא עדכנית
      }
      const commentsData = await getCommentsByPostId(postId);
      setSelectedPost(postData);
      setComments(commentsData.sort((a,b) => a.id - b.id)); // מיון תגובות לפי סדר כרונולוגי
    } catch (err) {
      setPageError(err.message);
      setSelectedPost(null); 
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
    setComments([]);
    setPageError(null); // איפוס שגיאה כללית בעת סגירת פרטים
  };

  const handleAddPostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) {
        setFormError("כותרת ותוכן הפוסט לא יכולים להיות ריקים.");
        return;
    }
    setFormError('');
    setPageError('');
    try {
        const postData = { title: newPostTitle, body: newPostBody, userId: parseInt(user.id) };
        const newPost = await addPost(postData);
        setPosts(prevPosts => [newPost, ...prevPosts].sort((a, b) => b.id - a.id)); // הוספה ומיון מחדש
        setNewPostTitle('');
        setNewPostBody('');
        setShowAddPostForm(false);
    } catch (err) {
        setFormError(err.message || "שגיאה בהוספת פוסט");
    }
  };

  const handleDeletePost = async (postId) => {
    setPageError('');
    // TODO: החלף את confirm במודל מותאם אישית כפי שנדרש בפרויקט
    if (window.confirm("האם אתה בטוח שברצונך למחוק פוסט זה וכל התגובות המשויכות אליו?")) {
        try {
            await deletePost(postId); 
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            if (selectedPost && selectedPost.id === postId) {
                handleCloseDetails(); 
            }
        } catch (err) {
            setPageError(err.message || "שגיאה במחיקת הפוסט");
        }
    }
  };
  
  const handleAddComment = async (commentData) => {
    // commentData כבר מכיל postId, name, email, body
    setPageError(''); // איפוס שגיאות עמוד
    const newComment = await addComment(commentData);
    setComments(prevComments => [...prevComments, newComment].sort((a,b) => a.id - b.id));
  };


  if (loading && !selectedPost) return <div className="loading-text">טוען פוסטים...</div>;
  // הצגת שגיאה כללית אם אין פוסטים וגם אין משתמש מחובר או הרשאה
  if (pageError && !posts.length && (!user || (user && userId !== user.id.toString()))) return <div className="error-text">שגיאה: {pageError}</div>;
  if (!user) return <div className="info-text">אנא התחבר כדי לראות את הפוסטים שלך.</div>;
  // הצגת שגיאת הרשאה ספציפית
  if (user && userId !== user.id.toString() && !loading) return <div className="error-text">אין לך הרשאה לצפות בפוסטים אלו.</div>;


  return (
    <div className="posts-page-container">
      <h1 className="page-title">הפוסטים שלי</h1>

      <button onClick={() => {setShowAddPostForm(!showAddPostForm); setFormError(''); setPageError('');}} className="button button-primary add-post-button">
        {showAddPostForm ? 'בטל הוספת פוסט' : 'הוסף פוסט חדש'}
      </button>

      {showAddPostForm && (
        <form onSubmit={handleAddPostSubmit} className="add-post-form">
          <h3 className="form-title">יצירת פוסט חדש</h3>
          <div>
            <label htmlFor="post-title" className="form-label">כותרת:</label>
            <input
              id="post-title"
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label htmlFor="post-body" className="form-label">תוכן:</label>
            <textarea
              id="post-body"
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
              rows="5"
              className="form-textarea"
              required
            />
          </div>
          {formError && <p className="form-error-message">{formError}</p>}
          <button type="submit" className="button button-green">פרסם פוסט</button>
        </form>
      )}
      
      {pageError && !selectedPost && <p className="error-text page-error-message">{pageError}</p>}

      {selectedPost ? (
        <PostDetailView 
            post={selectedPost} 
            comments={comments} 
            onAddComment={handleAddComment}
            onClose={handleCloseDetails}
            currentUser={user} // העברת אובייקט המשתמש המלא
        />
      ) : (
        posts.length === 0 && !loading && !pageError ? ( // הצג רק אם אין שגיאה ואין טעינה
          <p className="info-text">אין לך פוסטים כרגע.</p>
        ) : (
          !pageError && // אל תציג רשימת פוסטים אם יש שגיאה כללית
          <div className="post-list-container">
            {posts.map(post => (
              <div key={post.id} className="post-list-item-wrapper">
                <PostListItem post={post} onViewDetails={handleViewDetails} />
                <button onClick={() => handleDeletePost(post.id)} className="button button-delete delete-post-list-button">
                    מחק פוסט זה
                </button>
              </div>
            ))}
          </div>
        )
      )}
      {loadingComments && <div className="loading-text">טוען תגובות...</div>}
    </div>
  );
}
