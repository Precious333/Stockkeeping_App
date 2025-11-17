import React from 'react';
import { BoxIcon } from 'lucide-react';
interface StatCardProps {
  label: string;
  value: string | number;
  icon: BoxIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'red' | 'green' | 'yellow';
}
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue'
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };
  return <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>;
}