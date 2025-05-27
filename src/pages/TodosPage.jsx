// src/pages/TodosPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../App';
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
          {todo.title}
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
      // ה-onSubmit יקבל את הנתונים ויטפל בשליחה לשרת
      await onSubmit({ title, completed: initialData ? initialData.completed : false });
      if (!initialData) setTitle(''); // איפוס רק אם זה טופס הוספה
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
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null); 

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
        const newTodo = await addTodo({ ...todoData, userId: parseInt(user.id) }); // Ensure userId is a number if API expects it
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
    // מומלץ להחליף את confirm במודל מותאם אישית כפי שנדרש בפרויקט
    if (confirm("האם אתה בטוח שברצונך למחוק משימה זו?")) { 
        try {
            await deleteTodo(todoId);
            setTodos(prevTodos => prevTodos.filter(t => t.id !== todoId));
        } catch (err) {
            setError(err.message || "שגיאה במחיקת המשימה");
        }
    }
  };

  if (loading) return <div className="loading-text">טוען משימות...</div>;
  if (error && !todos.length && (!user || userId !== user.id.toString())) return <div className="error-text">שגיאה: {error}</div>;
  if (!user) return <div className="info-text">אנא התחבר כדי לראות את המשימות שלך.</div>;
  // If user is logged in but trying to access someone else's todos and fetchTodos has set an error
  if (error && userId !== user.id.toString()) return <div className="error-text">שגיאה: {error}</div>;


  return (
    <div className="todos-page-container">
      <h1 className="page-title">רשימת המשימות שלי</h1>
      <TodoForm 
        onSubmit={handleAddOrEditTodo} 
        initialData={editingTodo}
        onCancelEdit={() => setEditingTodo(null)}
      />
      {error && <p className="form-error-message page-error-message">{error}</p>}
      
      {todos.length === 0 && !loading && (
        <p className="info-text">אין לך משימות כרגע. למה שלא תוסיף אחת?</p>
      )}
      
      {todos.length > 0 && (
        <ul className="todo-list">
          {todos.map(todo => (
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
