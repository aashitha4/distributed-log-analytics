import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';

function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  const handleUploaded = () => {
    setRefreshToken((value) => value + 1);
  };

  return (
    <div className="container">
      <h1>Distributed Log Analytics & Anomaly Detection</h1>
      <UploadPage onUploaded={handleUploaded} />
      <Dashboard refreshToken={refreshToken} />
    </div>
  );
}

export default App;
