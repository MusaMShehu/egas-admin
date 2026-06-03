// // components/ChartComponent.js
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeScale,
// } from 'chart.js';
// import { Chart } from 'react-chartjs-2';
// import 'chartjs-adapter-luxon';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeScale
// );

// const ChartComponent = ({
//   title,
//   type,
//   endpoint,
//   timeframeOptions,
//   defaultTimeframe,
//   borderColor,
//   backgroundColor
// }) => {
//   const [timeframe, setTimeframe] = useState(defaultTimeframe);
//   const chartRef = useRef(null);

//   useEffect(() => {
//     fetchChartData();
//   }, [timeframe]);

//   const fetchChartData = async () => {
//     try {
//       const response = await fetch(`${endpoint}?days=${timeframe}`);
//       const data = await response.json();
      
//       // Format and update chart data
//       const formattedData = data.map(item => ({
//         x: new Date(item.date).toISOString(),
//         y: type === 'line' ? item.count : item.amount
//       }));
      
//       if (chartRef.current) {
//         chartRef.current.data.datasets[0].data = formattedData;
//         chartRef.current.update();
//       }
//     } catch (error) {
//       console.error('Error fetching chart data:', error);
//     }
//   };

//   const chartData = {
//     datasets: [
//       {
//         label: title,
//         data: [],
//         borderColor: borderColor,
//         backgroundColor: backgroundColor || borderColor,
//         borderWidth: type === 'line' ? 2 : 1,
//         tension: type === 'line' ? 0.1 : undefined,
//         fill: type === 'line'
//       }
//     ]
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         type: 'time',
//         time: {
//           unit: 'day'
//         },
//         grid: {
//           display: false
//         }
//       },
//       y: {
//         beginAtZero: true,
//         grid: {
//           drawBorder: false
//         }
//       }
//     },
//     plugins: {
//       legend: {
//         display: false
//       },
//       tooltip: {
//         mode: 'index',
//         intersect: false
//       }
//     },
//     interaction: {
//       mode: 'nearest',
//       axis: 'x',
//       intersect: false
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">{title}</h2>
//         <select
//           value={timeframe}
//           onChange={(e) => setTimeframe(e.target.value)}
//           className="border rounded px-2 py-1 text-sm"
//         >
//           {timeframeOptions.map(option => (
//             <option key={option} value={option}>
//               Last {option} Days
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="h-64">
//         <Chart
//           ref={chartRef}
//           type={type}
//           data={chartData}
//           options={options}
//         />
//       </div>
//     </div>
//   );
// };

// export default ChartComponent;




























// src/components/admin/AdminChartComponents.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import { adminAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ChartComponent = ({
  title,
  type,
  endpoint,
  timeframeOptions,
  defaultTimeframe,
  borderColor,
  backgroundColor
}) => {
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [chartData, setChartData] = useState({ datasets: [] });
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  const { error: showError } = useSnackbar();

  useEffect(() => {
    fetchChartData();
  }, [timeframe]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      // Map endpoint to actual API call
      let response;
      switch (endpoint) {
        case '/api/v1/admin/dashboard/chart-data':
          response = await adminAPI.dashboard.getChartData(timeframe);
          break;
        default:
          // For custom endpoints, we might need to add to adminAPI
          response = await adminAPI.get(endpoint, { params: { days: timeframe } });
      }
      const data = response.data
      if (data.success) {
        const data = data.data || data;
        const formattedData = data.map(item => ({
          x: new Date(item.date).toISOString(),
          y: type === 'line' ? item.count : item.amount
        }));
        
        setChartData({
          datasets: [{
            label: title,
            data: formattedData,
            borderColor: borderColor,
            backgroundColor: backgroundColor || borderColor,
            borderWidth: type === 'line' ? 2 : 1,
            tension: type === 'line' ? 0.1 : undefined,
            fill: type === 'line'
          }]
        });
      } else {
        showError(data.message || 'Failed to fetch chart data');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      showError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { drawBorder: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            disabled={loading}
          >
            {timeframeOptions.map(option => (
              <option key={option} value={option}>Last {option} Days</option>
            ))}
          </select>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {timeframeOptions.map(option => (
            <option key={option} value={option}>Last {option} Days</option>
          ))}
        </select>
      </div>
      <div className="h-64">
        <Chart
          ref={chartRef}
          type={type}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
};

export default ChartComponent;