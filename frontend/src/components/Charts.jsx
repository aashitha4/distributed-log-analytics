import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

function Charts({ results }) {
  const trafficData = results.map((item) => ({
    time: new Date(item.minuteWindow).toLocaleTimeString(),
    requestCount: item.requestCount
  }));

  const statusTotals = results.reduce(
    (acc, item) => {
      acc.success += item.status2xx || 0;
      acc.clientError += item.status4xx || 0;
      acc.serverError += item.status5xx || 0;
      return acc;
    },
    { success: 0, clientError: 0, serverError: 0 }
  );

  const statusData = [
    { name: '2xx', value: statusTotals.success },
    { name: '4xx', value: statusTotals.clientError },
    { name: '5xx', value: statusTotals.serverError }
  ];

  return (
    <div className="row">
      <div className="col card" style={{ height: 320 }}>
        <h3>Traffic over Time</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="requestCount" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="col card" style={{ height: 320 }}>
        <h3>HTTP Status Code Distribution</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} fill="#2563eb" label />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;
