function AnomalyAlerts({ anomalies }) {
  return (
    <div className="card">
      <h3>Alerts</h3>
      <table>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Reason</th>
            <th>Request Count</th>
            <th>Error Rate</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.length === 0 ? (
            <tr>
              <td colSpan={5}>No anomalies found.</td>
            </tr>
          ) : (
            anomalies.map((item) => (
              <tr key={`${item._id}-${item.minuteWindow}`}>
                <td>{item.ipAddress}</td>
                <td>{item.reason}</td>
                <td>{item.requestCount}</td>
                <td>{Number(item.errorRate || 0).toFixed(2)}</td>
                <td>{new Date(item.minuteWindow).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AnomalyAlerts;
