'use client';

import { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { AnalysisContext } from '../context/AnalysisContext';

const OrganismBarChart = () => {
  const { analysisData } = useContext(AnalysisContext)!;

  // Get top 10 organisms and format for bar chart
  const chartData = analysisData.taxaAbundance.slice(0, 10).map((taxa: any) => ({
    name: taxa.genus,
    percentage: parseFloat(taxa.percentage.toFixed(2)),
  }));

  // Custom color based on percentage
  const getBarColor = (percentage: number) => {
    if (percentage >= 75) return '#991b1b'; // dark red
    if (percentage >= 50) return '#dc2626'; // red
    if (percentage >= 30) return '#f97316'; // orange
    if (percentage >= 15) return '#fbbf24'; // yellow
    return '#60a5fa'; // blue
  };

  if (analysisData.taxaAbundance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500 text-lg">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 10 Organisms by Abundance</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any) => `${value.toFixed(2)}%`}
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Total organisms detected:</span> {analysisData.taxaAbundance.length}
        </p>
      </div>
    </div>
  );
};

export default OrganismBarChart;
