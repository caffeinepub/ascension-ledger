import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsRadarChartProps {
  stats: bigint[];
  statNames: string[];
  className?: string;
}

export function StatsRadarChart({ stats, statNames, className = '' }: StatsRadarChartProps) {
  // Transform stats data into format required by Recharts
  const chartData = statNames.map((name, index) => ({
    stat: name,
    value: Number(stats[index] || 0n),
  }));

  // Calculate max value for proper scaling
  const maxValue = Math.max(...chartData.map(d => d.value), 100);

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid 
            stroke="rgba(0, 217, 255, 0.2)" 
            strokeWidth={1}
          />
          <PolarAngleAxis 
            dataKey="stat" 
            tick={{ 
              fill: 'rgba(255, 255, 255, 0.85)', 
              fontSize: 12,
              fontWeight: 500
            }}
            tickLine={{ stroke: 'rgba(0, 217, 255, 0.3)' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, maxValue]}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
            stroke="rgba(0, 217, 255, 0.2)"
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke="rgba(0, 217, 255, 0.8)"
            fill="rgba(0, 217, 255, 0.25)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
            }}
            labelStyle={{ color: 'rgba(0, 217, 255, 1)', fontWeight: 600 }}
            itemStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
