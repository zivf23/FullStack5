// FormForTODOs.jsx
import React, { useEffect, useState } from 'react'

function FormForTODOs() {
  const [todos, setTodos] = useState([])
  const [filteredTodos, setFilteredTodos] = useState([])
  const [sortBy, setSortBy] = useState('id')
  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState('title')
  const [newTodo, setNewTodo] = useState('')
  const activeUserId = 1

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [todos, sortBy, search, searchField])

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:3001/todos')
      const data = await response.json()
      const userTodos = data.filter(todo => todo.userId === activeUserId)
      setTodos(userTodos)
    } catch (error) {
      console.error('Erreur lors du chargement des todos :', error)
    }
  }

  const applyFilters = () => {
    let result = [...todos]

    // Recherche
    if (search.trim()) {
      result = result.filter(todo => {
        const field = todo[searchField]
        if (typeof field === 'string') {
          return field.toLowerCase().includes(search.toLowerCase())
        }
        if (typeof field === 'boolean') {
          return field === (search === 'true')
        }
        return field == search
      })
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === 'id') return a.id - b.id
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'completed') return a.completed - b.completed
      return 0
    })

    setFilteredTodos(result)
  }

  const handleCheckboxChange = async (id, newValue) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: newValue } : todo
    )
    setTodos(updatedTodos)
    try {
      await fetch(`http://localhost:3001/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newValue })
      })
    } catch (error) {
      console.error('Erreur mise à jour :', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3001/todos/${id}`, { method: 'DELETE' })
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Erreur suppression :', error)
    }
  }

  const handleUpdate = async (id, updatedTitle) => {
    try {
      await fetch(`http://localhost:3001/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updatedTitle })
      })
      setTodos(todos.map(todo => todo.id === id ? { ...todo, title: updatedTitle } : todo))
    } catch (error) {
      console.error('Erreur mise à jour titre :', error)
    }
  }

  const handleAdd = async () => {
    if (!newTodo.trim()) return
    try {
      const response = await fetch('http://localhost:3001/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          title: newTodo,
          completed: false
        })
      })
      const added = await response.json()
      setTodos([...todos, added])
      setNewTodo('')
    } catch (error) {
      console.error('Erreur ajout :', error)
    }
  }

  return (
    <div>
      <h2>Todos utilisateur #{activeUserId}</h2>

      <div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
          <option value="id">ID</option>
          <option value="title">Titre</option>
          <option value="completed">Exécuté</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="id">Trier par ID</option>
          <option value="title">Trier par Titre</option>
          <option value="completed">Trier par Exécution</option>
        </select>
      </div>

      <div style={{ marginTop: '1em' }}>
        <input
          type="text"
          placeholder="Ajouter une tâche..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={handleAdd}>Ajouter</button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => handleCheckboxChange(todo.id, e.target.checked)}
            />
            <input
              type="text"
              value={todo.title}
              onChange={(e) => handleUpdate(todo.id, e.target.value)}
            />
            <button onClick={() => handleDelete(todo.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FormForTODOs
