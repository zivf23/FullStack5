// src/pages/TodosPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../App.jsx'; 
import { getTodosByUserId, addTodo, updateTodo, deleteTodo } from '../apiService';

// רכיב פנימי להצגת משימה בודדת
function TodoItem({ todo, onToggleComplete, onDelete, onEdit }) {
  return (
    <li className={`todo-item ${todo.completed ? 'todo-item-completed' : ''}`}>
      <div className="todo-item-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo)}
          className="todo-item-checkbox"
        />
        <span className={`todo-item-title ${todo.completed ? 'todo-item-title-completed' : ''}`}>
          (ID: {todo.id}) {todo.title}
        </span>
      </div>
      <div className="todo-item-actions">
        <button onClick={() => onEdit(todo)} className="button-edit">ערוך</button>
        <button onClick={() => onDelete(todo.id)} className="button-delete">מחק</button>
      </div>
    </li>
  );
}

// רכיב פנימי לטופס הוספה/עריכת משימה
function TodoForm({ onSubmit, initialData = null, onCancelEdit }) {
  const [title, setTitle] = useState(initialData ? initialData.title : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
    } else {
      setTitle('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError("כותרת המשימה לא יכולה להיות ריקה");
      return;
    }
    try {
      await onSubmit({ title, completed: initialData ? initialData.completed : false });
      if (!initialData) setTitle('');
    } catch (err) {
      setError(err.message || (initialData ? "שגיאה בעדכון משימה" : "שגיאה בהוספת משימה"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h3 className="form-title">{initialData ? 'עריכת משימה' : 'הוספת משימה חדשה'}</h3>
      <div className="todo-form-fields">
        <div className="form-field-group">
          <label htmlFor="todo-title" className="form-label">כותרת המשימה:</label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל, לקנות חלב"
            className="form-input"
          />
        </div>
        <button type="submit" className="button button-primary">
          {initialData ? 'עדכן משימה' : 'הוסף משימה'}
        </button>
        {initialData && (
          <button type="button" onClick={onCancelEdit} className="button button-secondary">
            בטל עריכה
          </button>
        )}
      </div>
      {error && <p className="form-error-message">{error}</p>}
    </form>
  );
}

export default function TodosPage() {
  const { user } = useAuth();
  const { userId: paramsUserId } = useParams(); 
  const [todos, setTodos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);

  const [sortBy, setSortBy] = useState('id'); 
  const [sortOrder, setSortOrder] = useState('asc'); 

  const [searchTermTitle, setSearchTermTitle] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('all'); 
  const [searchTermId, setSearchTermId] = useState('');


  useEffect(() => {
    setTodos([]);
    setError(null);
    setLoading(true);

    if (user && user.id && paramsUserId === user.id.toString()) {
      getTodosByUserId(user.id)
        .then(data => {
          setTodos(data);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (user && user.id && paramsUserId !== user.id.toString()) {
      setError("אין לך הרשאה לצפות במשימות אלו.");
      setLoading(false);
    } else if (!user) {
      setError("אנא התחבר כדי לצפות במשימות."); 
      setLoading(false);
    } else {
      setError("שגיאה בזיהוי משתמש או פרמטרים נדרשים.");
      setLoading(false);
    }
  }, [user, paramsUserId]); 

  const handleAddOrEditTodo = async (todoDataFromForm) => {
    setError(null); 
    if (!user || typeof user.id === 'undefined' || user.id === null) { 
        console.error('User or user.id is not defined/valid in handleAddOrEditTodo. User:', user);
        setError('שגיאה: פעולה זו דורשת משתמש מחובר עם מזהה תקין.');
        return;
    }

    const currentUserId = user.id; 

    try {
      if (editingTodo) {
        const payload = { ...editingTodo, ...todoDataFromForm, userId: currentUserId }; 
        const updated = await updateTodo(editingTodo.id, payload);
        setTodos(prevTodos => prevTodos.map(t => (t.id === updated.id ? updated : t)));
        setEditingTodo(null);
      } else { 
        const payload = { ...todoDataFromForm, userId: currentUserId }; 
        const newTodo = await addTodo(payload);
        setTodos(prevTodos => [newTodo, ...prevTodos]);
      }
    } catch (err) {
      setError(err.message || "שגיאה בשמירת המשימה");
    }
  };

  const handleToggleComplete = async (todoToUpdate) => {
    setError(null);
     if (!user || typeof user.id === 'undefined' || user.id === null) { 
        setError('שגיאה: נדרש משתמש מחובר עם מזהה תקין.');
        return;
    }
    try {
      const updatedTodoData = { ...todoToUpdate, completed: !todoToUpdate.completed, userId: user.id };
      const updated = await updateTodo(todoToUpdate.id, updatedTodoData);
      setTodos(prevTodos => prevTodos.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message || "שגיאה בעדכון סטטוס המשימה");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    setError(null);
    if (window.confirm("האם אתה בטוח שברצונך למחוק משימה זו?")) {
      try {
        await deleteTodo(todoId);
        setTodos(prevTodos => prevTodos.filter(t => t.id !== todoId));
      } catch (err) {
        setError(err.message || "שגיאה במחיקת המשימה");
      }
    }
  };

  const filteredAndSortedTodos = useMemo(() => {
    let processedTodos = [...todos];
    if (filterCompleted === 'completed') {
      processedTodos = processedTodos.filter(todo => todo.completed);
    } else if (filterCompleted === 'active') {
      processedTodos = processedTodos.filter(todo => !todo.completed);
    }
    if (searchTermTitle) {
      processedTodos = processedTodos.filter(todo =>
        todo.title.toLowerCase().includes(searchTermTitle.toLowerCase())
      );
    }
    if (searchTermId) {
        processedTodos = processedTodos.filter(todo =>
            todo.id.toString().includes(searchTermId) 
        );
    }
    
    // --- לוגיקת מיון מתוקנת ---
    processedTodos.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'id') {
        const numA = parseInt(valA, 10);
        const numB = parseInt(valB, 10);

        if (!isNaN(numA) && !isNaN(numB)) { // אם שניהם מספרים תקינים
          valA = numA;
          valB = numB;
        } else { // לפחות אחד מהם אינו מספר טהור, או שניהם. נשווה כמחרוזות.
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }
      } else if (sortBy === 'completed') {
        valA = a.completed ? 1 : 0; // true יהיה גדול מ-false (במיון עולה)
        valB = b.completed ? 1 : 0;
      } else if (typeof valA === 'string' && sortBy === 'title') { // מיון לפי כותרת
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      // (אם יש סוגי מיון נוספים, צריך להוסיף כאן תנאים)

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    // --- סוף לוגיקת מיון מתוקנת ---

    return processedTodos;
  }, [todos, sortBy, sortOrder, searchTermTitle, filterCompleted, searchTermId]);

  if (!user) return <div className="info-text">אנא התחבר כדי לצפות במשימות.</div>; 
  if (loading) return <div className="loading-text">טוען משימות...</div>;
  if (error) return <div className="error-text">שגיאה: {error}</div>; 


  return (
    <div className="todos-page-container">
      <h1 className="page-title">רשימת המשימות שלי (משתמש: {paramsUserId})</h1> 
      <TodoForm
        onSubmit={handleAddOrEditTodo}
        initialData={editingTodo}
        onCancelEdit={() => setEditingTodo(null)}
      />
      
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="sort-by" className="form-label">מיין לפי:</label>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
            <option value="id">ID</option>
            <option value="title">כותרת</option>
            <option value="completed">מצב ביצוע</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-select">
            <option value="asc">עולה</option>
            <option value="desc">יורד</option>
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="filter-title" className="form-label">חפש בכותרת:</label>
          <input
            id="filter-title"
            type="text"
            placeholder="הקלד לחיפוש..."
            value={searchTermTitle}
            onChange={(e) => setSearchTermTitle(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="control-group">
          <label htmlFor="filter-id" className="form-label">חפש ID:</label>
          <input
            id="filter-id"
            type="text"
            placeholder="הקלד ID..."
            value={searchTermId}
            onChange={(e) => setSearchTermId(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="control-group">
          <label htmlFor="filter-completed" className="form-label">סנן לפי מצב:</label>
          <select id="filter-completed" value={filterCompleted} onChange={(e) => setFilterCompleted(e.target.value)} className="form-select">
            <option value="all">הכל</option>
            <option value="active">פעילות</option>
            <option value="completed">הושלמו</option>
          </select>
        </div>
      </div>

      {filteredAndSortedTodos.length === 0 && !loading && (
        <p className="info-text">לא נמצאו משימות התואמות לחיפוש/סינון, או שאין לך משימות עדיין.</p>
      )}

      {filteredAndSortedTodos.length > 0 && (
        <ul className="todo-list">
          {filteredAndSortedTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onEdit={setEditingTodo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
