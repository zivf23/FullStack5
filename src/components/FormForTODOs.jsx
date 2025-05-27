// FormForTODOs.jsx
import React, { useEffect, useState } from 'react'

function FormForTODOs() {
  const [todos, setTodos] = useState([]) // État pour stocker les todos récupérés de l'API lorsque le composant est monté puis mis à jour lorsque l'utilisateur ajoute, modifie ou supprime une tâche
  const [filteredTodos, setFilteredTodos] = useState([]) // État pour stocker les todos filtrés et triés en fonction des critères de recherche et de tri
  const [sortBy, setSortBy] = useState('id') // État pour stocker le critère de tri sélectionné par l'utilisateur (par ID, titre ou état d'exécution)
  const [search, setSearch] = useState('') // État pour stocker la chaîne de recherche saisie par l'utilisateur pour filtrer les todos
  const [searchField, setSearchField] = useState('title') // État pour stocker le champ sur lequel la recherche est effectuée (ID, titre ou état d'exécution)
  const [newTodo, setNewTodo] = useState('') // État pour stocker la nouvelle tâche saisie par l'utilisateur avant de l'ajouter à la liste des todos
  const activeUserId = 1

  useEffect(() => { // Chargement initial des todos
    fetchTodos()
  }, [])

  useEffect(() => { // Application des filtres et du tri quand les todos changent ou les paramètres de recherche/tri changent 
    applyFilters()
  }, [todos, sortBy, search, searchField])

  const fetchTodos = async () => { // Récupération des todos de l'API qui sont associés à l'utilisateur actif lorsque le composant est monté
    try {
      const response = await fetch('http://localhost:3001/todos')
      const data = await response.json()
      const userTodos = data.filter(todo => todo.userId === activeUserId)
      setTodos(userTodos)
    } catch (error) {
      console.error('Erreur lors du chargement des todos :', error)
    }
  }

  const applyFilters = () => { // Application des filtres et du tri sur la liste des todos lorsque les todos ou les paramètres de recherche/tri changent
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

  const handleCheckboxChange = async (id, newValue) => { // Mise à jour de l'état d'exécution d'une tâche lorsque l'utilisateur coche ou décoche la case correspondante
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

  const handleDelete = async (id) => { // Suppression d'une tâche lorsque l'utilisateur clique sur le bouton de suppression
    try {
      await fetch(`http://localhost:3001/todos/${id}`, { method: 'DELETE' })
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Erreur suppression :', error)
    }
  }

  const handleUpdate = async (id, updatedTitle) => { // Mise à jour du titre d'une tâche lorsque l'utilisateur modifie le champ de saisie correspondant
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

  const handleAdd = async () => { // Ajout d'une nouvelle tâche lorsque l'utilisateur saisit un titre et clique sur le bouton "Ajouter"
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

      <div> {/* Barre de recherche et de tri */}
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

      <div style={{ marginTop: '1em' }}> {/* Formulaire pour ajouter une nouvelle tâche */}
        <input
          type="text"
          placeholder="Ajouter une tâche..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={handleAdd}>Ajouter</button>
      </div>

      <ul> {/* Liste des tâches filtrées et triées */}
        {filteredTodos.map(todo => ( 
          <li key={todo.id}> 
            <span><strong>ID {todo.id}</strong>: </span>
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
