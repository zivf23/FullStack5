// src/pages/TodosPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../App.jsx'; // ודא שהנתיב נכון אם App.js/jsx נמצא במקום אחר
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
          {/* הצגת ID להמחשה, אפשר להסיר אם לא נדרש בתצוגה הסופית */}
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
  const { userId } = useParams();
  const [todos, setTodos] = useState([]); // רשימת המשימות המקורית מהשרת
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);

  // State עבור מיון
  const [sortBy, setSortBy] = useState('id'); // 'id', 'title', 'completed'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // State עבור חיפוש/סינון
  const [searchTermTitle, setSearchTermTitle] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('all'); // 'all', 'completed', 'active'
  const [searchTermId, setSearchTermId] = useState('');


  const fetchTodos = useCallback(async () => {
    if (user && userId === user.id.toString()) {
      setLoading(true);
      setError(null);
      try {
        const data = await getTodosByUserId(user.id);
        setTodos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (user && userId !== user.id.toString()) {
      setError("אין לך הרשאה לצפות במשימות אלו.");
      setLoading(false);
      setTodos([]);
    }
  }, [user, userId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddOrEditTodo = async (todoData) => {
    setError('');
    try {
      if (editingTodo) {
        const updated = await updateTodo(editingTodo.id, { ...editingTodo, ...todoData });
        setTodos(prevTodos => prevTodos.map(t => (t.id === updated.id ? updated : t)));
        setEditingTodo(null);
      } else {
        const newTodo = await addTodo({ ...todoData, userId: parseInt(user.id) });
        setTodos(prevTodos => [newTodo, ...prevTodos]);
      }
    } catch (err) {
      setError(err.message || "שגיאה בשמירת המשימה");
    }
  };

  const handleToggleComplete = async (todoToUpdate) => {
    setError('');
    try {
      const updatedTodoData = { ...todoToUpdate, completed: !todoToUpdate.completed };
      const updated = await updateTodo(todoToUpdate.id, updatedTodoData);
      setTodos(prevTodos => prevTodos.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message || "שגיאה בעדכון סטטוס המשימה");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    setError('');
    // TODO: החלף את confirm במודל מותאם אישית
    if (window.confirm("האם אתה בטוח שברצונך למחוק משימה זו?")) {
      try {
        await deleteTodo(todoId);
        setTodos(prevTodos => prevTodos.filter(t => t.id !== todoId));
      } catch (err) {
        setError(err.message || "שגיאה במחיקת המשימה");
      }
    }
  };

  // לוגיקה לסינון ומיון של רשימת המשימות
  // useMemo מבטיח שהחישוב המורכב הזה ירוץ רק אם התלויות שלו משתנות
  const filteredAndSortedTodos = useMemo(() => {
    let processedTodos = [...todos];

    // 1. סינון לפי מצב ביצוע
    if (filterCompleted === 'completed') {
      processedTodos = processedTodos.filter(todo => todo.completed);
    } else if (filterCompleted === 'active') {
      processedTodos = processedTodos.filter(todo => !todo.completed);
    }

    // 2. סינון לפי חיפוש בכותרת (לא תלוי רישיות)
    if (searchTermTitle) {
      processedTodos = processedTodos.filter(todo =>
        todo.title.toLowerCase().includes(searchTermTitle.toLowerCase())
      );
    }
    
    // 3. סינון לפי חיפוש ב-ID
    if (searchTermId) {
        processedTodos = processedTodos.filter(todo =>
            todo.id.toString().includes(searchTermId)
        );
    }

    // 4. מיון
    processedTodos.sort((a, b) => {
      let compareA = a[sortBy];
      let compareB = b[sortBy];

      // המרה למספרים אם ממיינים לפי ID
      if (sortBy === 'id') {
        compareA = parseInt(compareA, 10);
        compareB = parseInt(compareB, 10);
      }
      // טיפול במצב בוליאני (completed)
      else if (sortBy === 'completed') {
        compareA = a.completed ? 1 : 0;
        compareB = b.completed ? 1 : 0;
      }
      // טיפול במחרוזות (title) - לא תלוי רישיות
      else if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (compareA < compareB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return processedTodos;
  }, [todos, sortBy, sortOrder, searchTermTitle, filterCompleted, searchTermId]);


  if (loading) return <div className="loading-text">טוען משימות...</div>;
  if (error && !todos.length && (!user || userId !== user.id.toString())) return <div className="error-text">שגיאה: {error}</div>;
  if (!user) return <div className="info-text">אנא התחבר כדי לראות את המשימות שלך.</div>;
  if (user && userId !== user.id.toString() && !loading && !error) return <div className="error-text">אין לך הרשאה לצפות במשימות אלו.</div>;


  return (
    <div className="todos-page-container">
      <h1 className="page-title">רשימת המשימות שלי</h1>
      <TodoForm
        onSubmit={handleAddOrEditTodo}
        initialData={editingTodo}
        onCancelEdit={() => setEditingTodo(null)}
      />
      {error && <p className="form-error-message page-error-message">{error}</p>}

      {/* פקדי מיון וסינון */}
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
