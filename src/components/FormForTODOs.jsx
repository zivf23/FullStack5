import React, { useEffect, useState } from 'react'

function FormForTODOs() {
  const [todos, setTodos] = useState([])
  const activeUserId = 1

  useEffect(() => {
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

    fetchTodos()
  }, [])

  const handleCheckboxChange = async (id, newValue) => {
    // Met à jour localement
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: newValue } : todo
    )
    setTodos(updatedTodos)

    // Met à jour sur le serveur (PATCH)
    try {
      await fetch(`http://localhost:3001/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newValue })
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du todo :', error)
    }
  }

  return (
    <div>
      <h2>Todos de l'utilisateur #{activeUserId}</h2>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <strong>ID {todo.id}</strong> – {todo.title}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => handleCheckboxChange(todo.id, e.target.checked)}
              style={{ marginLeft: '10px' }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FormForTODOs
