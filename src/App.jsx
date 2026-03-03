import React, { useState } from 'react';
import Board from './components/Board';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import SetupScreen from './components/SetupScreen';
import { useGame } from './context/GameContext';

function App() {
  const { state, dispatch } = useGame();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  if (state.phase === 'SETUP') {
    return <SetupScreen />;
  }

  return (
    <>
      <button
        onClick={() => setShowQuitConfirm(true)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, var(--accent-gold) 0%, #d4af37 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem'
        }}
      >
        HOME
      </button>

      {showQuitConfirm && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="glass-panel modal-content" style={{ background: '#fff', border: '2px solid var(--accent-gold)' }}>
            <h2 className="modal-title" style={{ marginBottom: '1rem', color: '#111' }}>Quit Game?</h2>
            <p style={{ color: '#333' }}>Are you sure you want to quit the current game? All progress will be lost.</p>
            <div className="btn-group" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn-pass"
                style={{ background: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold' }}
                onClick={() => {
                  setShowQuitConfirm(false);
                  dispatch({ type: 'RESET_GAME' });
                }}
              >
                Yes, Quit
              </button>
              <button
                className="btn-primary"
                style={{ padding: '10px 20px' }}
                onClick={() => setShowQuitConfirm(false)}
              >
                No, Resume
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="app-container">
        <LeftSidebar />
        <Board />
        <RightSidebar />
      </div>
    </>
  );
}

export default App;
