// src/pages/PostsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// useParams לא נחוץ כאן אם מציגים את כל הפוסטים, אך נשאיר למקרה שנרצה להשתמש בו לקישור ישיר לפוסט בעתיד
import { useParams } from 'react-router-dom'; 
import { useAuth } from '../App.jsx';
import { 
    getAllPosts, 
    getPostById, // ודא שהפונקציה הזו מיוצאת מ-apiService.js/jsx
    getCommentsByPostId, 
    addPost, 
    updatePost, 
    deletePost, 
    addComment,
    updateComment, 
    deleteComment  
} from '../apiService';

// רכיב להצגת פוסט בודד ברשימה
function PostListItem({ post, onViewDetails, onEditPost, onDeletePost, currentUser }) {
  const isOwner = currentUser && currentUser.id === post.userId;
  return (
    <div className="post-list-item">
      <h3 className="post-item-title">(ID: {post.id}) {post.title}</h3>
      <div className="post-item-actions">
        <button onClick={() => onViewDetails(post.id)} className="button button-outline">
          הצג פרטים ותגובות
        </button>
        {isOwner && ( 
          <>
            <button onClick={() => onEditPost(post)} className="button button-edit">ערוך פוסט</button>
            <button onClick={() => onDeletePost(post.id)} className="button button-delete">מחק פוסט</button>
          </>
        )}
      </div>
    </div>
  );
}

// טופס להוספה/עריכה של פוסט
function PostForm({ onSubmit, initialData = null, onCancel, formTitle }) {
    const [title, setTitle] = useState(initialData ? initialData.title : '');
    const [body, setBody] = useState(initialData ? initialData.body : '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setBody(initialData.body);
        } else {
            setTitle('');
            setBody('');
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !body.trim()) {
            setError("כותרת ותוכן הפוסט לא יכולים להיות ריקים.");
            return;
        }
        try {
            await onSubmit({ title, body });
        } catch (err) {
            setError(err.message || "שגיאה בשמירת הפוסט");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-post-form"> 
            <h3 className="form-title">{formTitle}</h3>
            <div>
                <label htmlFor="post-form-title" className="form-label">כותרת:</label>
                <input
                    id="post-form-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                    required
                />
            </div>
            <div>
                <label htmlFor="post-form-body" className="form-label">תוכן:</label>
                <textarea
                    id="post-form-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows="5"
                    className="form-textarea"
                    required
                />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <div className="form-actions">
                <button type="submit" className="button button-green">{initialData ? "עדכן פוסט" : "פרסם פוסט"}</button>
                {onCancel && <button type="button" onClick={onCancel} className="button button-secondary">בטל</button>}
            </div>
        </form>
    );
}


// רכיב להצגת פרטי פוסט ותגובות
function PostDetailView({ post, comments, onAddComment, onClose, currentUser, onEditComment, onDeleteComment }) {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [editingComment, setEditingComment] = useState(null); 

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      setCommentError("התגובה לא יכולה להיות ריקה.");
      return;
    }
    setCommentError('');
    const commentData = {
      postId: post.id,
      name: `תגובה מאת: ${currentUser.name || currentUser.username}`,
      email: currentUser.email, 
      body: newCommentText,
    };
    try {
      await onAddComment(commentData);
      setNewCommentText(''); 
    } catch (error) {
      setCommentError(error.message || "שגיאה בהוספת תגובה");
    }
  };

  const handleEditCommentSubmit = async (commentId, updatedBody) => {
    const originalComment = comments.find(c => c.id === commentId);
    if (!originalComment) return;

    const updatedCommentData = { ...originalComment, body: updatedBody };
    try {
        await onEditComment(commentId, updatedCommentData);
        setEditingComment(null); 
    } catch (error) {
        console.error("Error updating comment:", error);
    }
  };

  return (
    <div className="post-detail-view">
      <button onClick={onClose} className="button button-secondary close-button">חזור לרשימת הפוסטים</button>
      <h2 className="post-detail-title">{post.title} (נכתב על ידי משתמש ID: {post.userId})</h2>
      <p className="post-detail-body">{post.body}</p>
      <hr className="section-divider" />
      <h3 className="comments-title">תגובות</h3>
      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map(comment => (
            <li key={comment.id} className="comment-item">
              {editingComment && editingComment.id === comment.id ? (
                <EditCommentForm 
                    comment={editingComment} 
                    onSubmit={(updatedBody) => handleEditCommentSubmit(comment.id, updatedBody)}
                    onCancel={() => setEditingComment(null)}
                />
              ) : (
                <>
                  <strong>{comment.name} ({comment.email}):</strong>
                  <p>{comment.body}</p>
                  {currentUser && currentUser.email === comment.email && ( 
                    <div className="comment-actions">
                      <button onClick={() => setEditingComment(comment)} className="button-edit">ערוך</button>
                      <button onClick={() => onDeleteComment(comment.id)} className="button-delete">מחק</button>
                    </div>
                  )}
                </>
              )}
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

// טופס לעריכת תגובה
function EditCommentForm({ comment, onSubmit, onCancel }) {
    const [body, setBody] = useState(comment.body);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(body);
    };
    return (
        <form onSubmit={handleSubmit} className="edit-comment-form">
            <textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                rows="2" 
                className="form-textarea"
            />
            <div className="form-actions">
                <button type="submit" className="button button-green">שמור שינויים</button>
                <button type="button" onClick={onCancel} className="button button-secondary">בטל</button>
            </div>
        </form>
    );
}

export default function PostsPage() {
  const { user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [editingPost, setEditingPost] = useState(null); 
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [showAddPostForm, setShowAddPostForm] = useState(false);
  
  const [searchTermId, setSearchTermId] = useState('');
  const [searchTermTitle, setSearchTermTitle] = useState('');


  const fetchAllPosts = useCallback(async () => {
      setLoading(true);
      setPageError(null);
      try {
        const data = await getAllPosts(); 
        setPosts(data.sort((a, b) => b.id - a.id)); 
      } catch (err) {
        setPageError(err.message);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    if (user) { 
        fetchAllPosts();
    } else {
        setPosts([]); 
        setLoading(false);
    }
  }, [user, fetchAllPosts]);

  const handleViewDetails = async (postId) => {
    setLoadingComments(true);
    setPageError(null); 
    try {
      const postData = await getPostById(postId); // <-- שימוש ב-getPostById
      const commentsData = await getCommentsByPostId(postId);
      setSelectedPost(postData);
      setComments(commentsData.sort((a,b) => a.id - b.id)); 
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
    setPageError(null); 
  };

  const handleAddPost = async (postDataFromForm) => {
    if (!user) {
        setFormError("עליך להיות מחובר כדי להוסיף פוסט.");
        return;
    }
    setFormError('');
    setPageError('');
    try {
        const postPayload = { ...postDataFromForm, userId: user.id }; 
        const newPost = await addPost(postPayload);
        setPosts(prevPosts => [newPost, ...prevPosts].sort((a, b) => b.id - a.id)); 
        setShowAddPostForm(false); 
    } catch (err) {
        setFormError(err.message || "שגיאה בהוספת פוסט");
    }
  };

  const handleEditPost = (postToEdit) => {
    setEditingPost(postToEdit);
    setSelectedPost(null); 
    setShowAddPostForm(false); 
  };

  const handleUpdatePost = async (updatedPostDataFromForm) => {
    if (!editingPost) return;
    setFormError('');
    setPageError('');
    try {
        const payload = { ...editingPost, ...updatedPostDataFromForm };
        const updated = await updatePost(editingPost.id, payload);
        setPosts(prevPosts => prevPosts.map(p => p.id === updated.id ? updated : p).sort((a,b) => b.id - a.id));
        setEditingPost(null); 
    } catch (err) {
        setFormError(err.message || "שגיאה בעדכון הפוסט");
    }
  };


  const handleDeletePost = async (postId) => {
    setPageError('');
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
    setPageError(null); 
    try {
        const newComment = await addComment(commentData);
        setComments(prevComments => [...prevComments, newComment].sort((a,b) => a.id - b.id));
    } catch (error) {
        setPageError(error.message || "שגיאה בהוספת תגובה"); 
        throw error; 
    }
  };

  const handleEditComment = async (commentId, updatedCommentData) => {
    setPageError(null);
    try {
        const updated = await updateComment(commentId, updatedCommentData);
        setComments(prevComments => prevComments.map(c => c.id === commentId ? updated : c).sort((a,b) => a.id - b.id));
    } catch (error) {
        setPageError(error.message || "שגיאה בעדכון תגובה");
    }
  };

  const handleDeleteComment = async (commentId) => {
    setPageError(null);
    if (window.confirm("האם אתה בטוח שברצונך למחוק תגובה זו?")) {
        try {
            await deleteComment(commentId);
            setComments(prevComments => prevComments.filter(c => c.id !== commentId));
        } catch (error) {
            setPageError(error.message || "שגיאה במחיקת תגובה");
        }
    }
  };

  const searchedPosts = useMemo(() => {
    let processedPosts = [...posts];
    if (searchTermTitle) {
        processedPosts = processedPosts.filter(post =>
            post.title.toLowerCase().includes(searchTermTitle.toLowerCase())
        );
    }
    if (searchTermId) {
        processedPosts = processedPosts.filter(post =>
            post.id.toString().includes(searchTermId)
        );
    }
    return processedPosts;
  }, [posts, searchTermId, searchTermTitle]);


  if (!user) return <div className="info-text">אנא התחבר כדי לצפות ולהשתתף בדיונים.</div>; 
  if (loading && !selectedPost && !editingPost) return <div className="loading-text">טוען פוסטים...</div>;
  if (pageError && !selectedPost && !editingPost && posts.length === 0) return <div className="error-text page-error-message">{pageError}</div>;

  return (
    <div className="posts-page-container">
      <h1 className="page-title">כל הפוסטים</h1>

      {!selectedPost && !editingPost && ( 
        <>
          <div className="controls-container posts-controls">
            <div className="control-group">
              <label htmlFor="search-post-title" className="form-label">חפש פוסט לפי כותרת:</label>
              <input
                id="search-post-title"
                type="text"
                placeholder="הקלד כותרת..."
                value={searchTermTitle}
                onChange={(e) => setSearchTermTitle(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="control-group">
              <label htmlFor="search-post-id" className="form-label">חפש פוסט לפי ID:</label>
              <input
                id="search-post-id"
                type="text"
                placeholder="הקלד ID..."
                value={searchTermId}
                onChange={(e) => setSearchTermId(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          
          <button onClick={() => {setShowAddPostForm(!showAddPostForm); setFormError(''); setEditingPost(null);}} className="button button-primary add-post-button">
            {showAddPostForm ? 'בטל הוספת פוסט' : 'הוסף פוסט חדש'}
          </button>

          {showAddPostForm && (
            <PostForm 
                onSubmit={handleAddPost} 
                onCancel={() => {setShowAddPostForm(false); setFormError('');}}
                formTitle="יצירת פוסט חדש"
            />
          )}
          {formError && <p className="form-error-message">{formError}</p>}
        </>
      )}

      {editingPost && (
          <PostForm 
            onSubmit={handleUpdatePost}
            initialData={editingPost}
            onCancel={() => {setEditingPost(null); setFormError('');}}
            formTitle="עריכת פוסט"
          />
      )}
      
      {pageError && !selectedPost && !editingPost && <p className="error-text page-error-message">{pageError}</p>}

      {selectedPost ? (
        <PostDetailView 
            post={selectedPost} 
            comments={comments} 
            onAddComment={handleAddComment}
            onClose={handleCloseDetails}
            currentUser={user} 
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
        />
      ) : (
        !editingPost && searchedPosts.length === 0 && !loading && !pageError ? ( 
          <p className="info-text">לא נמצאו פוסטים התואמים לחיפוש, או שאין פוסטים עדיין.</p>
        ) : (
          !editingPost && !pageError &&
          <div className="post-list-container">
            {searchedPosts.map(post => (
              <div key={post.id} className="post-list-item-wrapper">
                <PostListItem 
                    post={post} 
                    onViewDetails={handleViewDetails} 
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    currentUser={user}
                />
              </div>
            ))}
          </div>
        )
      )}
      {loadingComments && <div className="loading-text">טוען תגובות...</div>}
    </div>
  );
}

