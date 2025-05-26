import React, { useState } from 'react'
import FormForTODOs from './components/FormForTODOs'

function App() {
  const [showTodos, setShowTodos] = useState(false)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mon Application React</h1>
      <button onClick={() => setShowTodos(true)}>Todos</button>
      {showTodos && <FormForTODOs />}
    </div>
  )
}

export default App