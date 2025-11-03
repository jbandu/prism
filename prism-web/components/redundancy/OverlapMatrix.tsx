'use client';

import { useMemo } from 'react';

interface OverlapMatrixProps {
  data: Array<{
    software1: { software_name: string; annual_cost: number };
    software2: { software_name: string; annual_cost: number };
    overlapPercentage: number;
    costImplication: number;
    sharedFeatures: string[];
  }>;
}

export function OverlapMatrix({ data }: OverlapMatrixProps) {
  const matrix = useMemo(() => {
    if (!data || data.length === 0) {
      return { softwareList: [], matrixData: [] };
    }

    const uniqueSoftware = new Set<string>();
    data.forEach(d => {
      uniqueSoftware.add(d.software1.software_name);
      uniqueSoftware.add(d.software2.software_name);
    });

    const softwareList = Array.from(uniqueSoftware);

    const matrixData = softwareList.map(sw1 =>
      softwareList.map(sw2 => {
        if (sw1 === sw2) return { overlap: 0, self: true, cost: 0, features: [] };

        const match = data.find(
          d =>
            (d.software1.software_name === sw1 && d.software2.software_name === sw2) ||
            (d.software1.software_name === sw2 && d.software2.software_name === sw1)
        );

        return {
          overlap: match?.overlapPercentage || 0,
          cost: match?.costImplication || 0,
          features: match?.sharedFeatures || [],
          self: false,
        };
      })
    );

    return { softwareList, matrixData };
  }, [data]);

  const getColorForOverlap = (percent: number) => {
    if (percent === 0) return 'bg-gray-800';
    if (percent < 25) return 'bg-blue-900/50';
    if (percent < 50) return 'bg-yellow-900/50';
    if (percent < 75) return 'bg-orange-900/50';
    return 'bg-red-900/50';
  };

  if (matrix.softwareList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No overlap data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              {matrix.softwareList.map(sw => (
                <th
                  key={sw}
                  className="p-2 text-xs text-gray-400 font-normal max-w-[100px] truncate"
                  title={sw}
                >
                  <div className="transform -rotate-45 origin-left whitespace-nowrap">
                    {sw}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.softwareList.map((sw1, i) => (
              <tr key={sw1}>
                <td className="p-2 text-sm text-gray-400 font-medium max-w-[150px] truncate">
                  {sw1}
                </td>
                {matrix.matrixData[i].map((cell, j) => (
                  <td
                    key={j}
                    className={`p-4 text-center text-sm ${getColorForOverlap(cell.overlap)} ${
                      cell.self
                        ? 'border-2 border-gray-600'
                        : 'cursor-pointer hover:ring-2 hover:ring-white transition-all'
                    }`}
                    title={
                      cell.self
                        ? sw1
                        : `${cell.overlap.toFixed(1)}% overlap\n$${cell.cost.toFixed(0)} redundancy\n${cell.features.length} shared features`
                    }
                  >
                    {cell.self ? '—' : cell.overlap > 0 ? `${cell.overlap.toFixed(0)}%` : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm border-t border-gray-700 pt-4">
        <span className="text-gray-400 font-semibold">Overlap Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-800 rounded border border-gray-600"></div>
          <span className="text-gray-400">None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-900/50 rounded"></div>
          <span className="text-gray-400">Low (&lt;25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-900/50 rounded"></div>
          <span className="text-gray-400">Medium (25-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-900/50 rounded"></div>
          <span className="text-gray-400">High (50-75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-900/50 rounded"></div>
          <span className="text-gray-400">Critical (&gt;75%)</span>
        </div>
      </div>
    </div>
  );
}
