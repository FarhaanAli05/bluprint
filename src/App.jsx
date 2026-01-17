import React from 'react';
import './App.css';

function App() {
  const handleCreateModel = () => {
    console.log('Creating 3D model and importing to room...');
    // Add your logic here
    alert('Creating 3D model and importing to room!');
  };

  return (
    <div className="app-container">
      <div className="box">
        <h2>3D Model Importer</h2>
        <button className="create-button" onClick={handleCreateModel}>
          Create 3D Model and Import to Room
        </button>
      </div>
    </div>
  );
}

export default App;
