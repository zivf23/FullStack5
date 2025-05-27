import React, { useState } from 'react';
import FormForTODOs from './components/FormForTODOs';
import FormForPOSTs from './components/FormForPOSTs';

function App() {
  const [showTodos, setShowTodos] = useState(false);
  const [showPosts, setShowPosts] = useState(false);

  // Simule un utilisateur connecté (à remplacer plus tard avec LocalStorage ou contexte utilisateur)
  const activeUserId = 1;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mon Application React</h1>

      <div style={{ marginBottom: '1em' }}>
        <button onClick={() => setShowTodos(prev => !prev)}>
          {showTodos ? 'Cacher Todos' : 'Afficher Todos'}
        </button>
        <button onClick={() => setShowPosts(prev => !prev)}>
          {showPosts ? 'Cacher Posts' : 'Afficher Posts'}
        </button>
      </div>

      {showTodos && <FormForTODOs activeUserId={activeUserId} />}
      {showPosts && <FormForPOSTs activeUserId={activeUserId} />}
    </div>
  );
}

export default App;
