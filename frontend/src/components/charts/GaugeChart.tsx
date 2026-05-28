import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  value: number;
  maxValue?: number;
  label?: string;
  size?: number;
}

const COLORS = ['#39FF14', '#1a1a1a'];

export default function GaugeChart({ value, maxValue = 100, label, size = 200 }: Props) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const data = [
    { name: 'value', value: percentage },
    { name: 'remainder', value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size / 2 + 20 }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="90%"
              startAngle={180}
              endAngle={0}
              innerRadius={size * 0.3}
              outerRadius={size * 0.42}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-3xl font-bold text-white">{value.toFixed(1)}</span>
          {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
        </div>
      </div>
    </div>
  );
}
