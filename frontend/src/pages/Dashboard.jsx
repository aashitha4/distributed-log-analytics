import { useEffect, useState } from 'react';
import AnomalyAlerts from '../components/AnomalyAlerts';
import Charts from '../components/Charts';
import { fetchAnomalies, fetchResults } from '../services/api';

function Dashboard({ refreshToken }) {
  const [results, setResults] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [resultsData, anomaliesData] = await Promise.all([fetchResults(), fetchAnomalies()]);
        setResults(resultsData);
        setAnomalies(anomaliesData);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshToken]);

  return (
    <div>
      {loading ? <p>Loading dashboard...</p> : <Charts results={results} />}
      <AnomalyAlerts anomalies={anomalies} />
    </div>
  );
}

export default Dashboard;
