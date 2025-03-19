
import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Edit2 } from 'lucide-react';
import type { TokenAllocation } from '@/types/tokenomics';

interface Props {
  data: TokenAllocation[];
  onTemplateSelect?: (template: TokenAllocation[]) => void;
  onAllocationChange?: (index: number, newPercentage: number) => void;
}

// Enhanced colors with better contrast for white background
const COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Vivid Purple
  '#14B8A6', // Teal
  '#D946EF', // Magenta Pink
  '#3B82F6', // Blue
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Card className="bg-white/90 dark:bg-zinc-900/90 p-3 border-none shadow-lg">
        <p className="font-medium text-sm">{data.category}</p>
        <p className="text-sm text-muted-foreground">
          {data.percentage.toFixed(1)}% ({(data.percentage * 1000000000 / 100).toLocaleString()} tokens)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Vesting: {data.vesting.duration} months
          {data.vesting.cliff > 0 && ` (${data.vesting.cliff} months cliff)`}
        </p>
      </Card>
    );
  }
  return null;
};

// Custom label component for pie chart sections - displaying labels repositioned
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload } = props;
  const RADIAN = Math.PI / 180;
  
  // Adjust the radius to position labels at a more central location
  const radius = outerRadius * 1.25; // Increased from 1.15 to push labels further out
  
  // Calculate position with adjusted angle to move labels downward
  const adjustedAngle = midAngle * 0.85; // Reduce angle influence to shift toward bottom
  const x = cx + radius * Math.cos(-adjustedAngle * RADIAN);
  const y = cy + radius * Math.sin(-adjustedAngle * RADIAN) + 15; // Add offset to push down
  
  // Only show label if percentage is large enough to be visible
  if (percent < 0.04) return null;
  
  // Determine text anchor based on the position of label
  const textAnchor = x > cx ? 'start' : 'end';
  
  return (
    <text 
      x={x} 
      y={y} 
      fill={COLORS[index % COLORS.length]}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontWeight="bold"
      fontSize={12}
    >
      {`${payload.category} (${payload.percentage}%)`}
    </text>
  );
};

export const TokenDistributionChart: React.FC<Props> = ({ data, onTemplateSelect, onAllocationChange }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);
  
  // Create a new data array with exact percentage values (not calculated from percent)
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      // Ensure percentage is a whole number for display
      percentage: Math.round(item.percentage)
    }));
  }, [data]);

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(index);
    setEditingValue(chartData[index].percentage);
  };

  const handleSliderChange = (value: number[]) => {
    setEditingValue(value[0]);
  };

  const handleSaveAllocation = () => {
    if (onAllocationChange && activeIndex !== null) {
      onAllocationChange(activeIndex, editingValue);
      setActiveIndex(null);
    }
  };

  return (
    <div className="space-y-2 flex flex-col items-center justify-center h-full w-full">
      <div className="w-full relative" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderCustomizedLabel}
              outerRadius={110} // Reduced radius to make room for external labels
              fill="#8884d8"
              dataKey="percentage"
              nameKey="category"
              onClick={handlePieClick}
              className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              activeIndex={activeIndex !== null ? [activeIndex] : []}
              activeShape={(props) => {
                const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                return (
                  <g>
                    <g>
                      {renderCustomizedLabel(props)}
                    </g>
                    <path 
                      d={`M ${cx},${cy} L ${cx + outerRadius * Math.cos(-startAngle * Math.PI / 180)},${cy + outerRadius * Math.sin(-startAngle * Math.PI / 180)} A ${outerRadius},${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0},0 ${cx + outerRadius * Math.cos(-endAngle * Math.PI / 180)},${cy + outerRadius * Math.sin(-endAngle * Math.PI / 180)} Z`} 
                      fill={fill}
                      stroke="#fff"
                      strokeWidth={3}
                      opacity={0.9}
                    />
                  </g>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-300 ease-in-out hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              height={36} // Reduced from 40 to minimize empty space
              layout="horizontal"
              align="center"
              wrapperStyle={{
                paddingTop: "10px", // Reduced from 20px
                fontSize: "12px",
                bottom: "0px" // Changed from -10px to reduce empty space
              }}
              formatter={(value: string, entry: any) => {
                const { payload } = entry;
                return (
                  <span className="text-xs font-medium">
                    {value} ({payload.percentage}%)
                  </span>
                );
              }}
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>

        {activeIndex !== null && (
          <div className="absolute top-0 right-0 z-10 p-3 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-3 w-56">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{chartData[activeIndex]?.category}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveIndex(null)}
                  className="h-7 w-7 p-0"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Allocation Percentage</span>
                  <span className="text-xs font-medium">{editingValue}%</span>
                </div>
                <Slider
                  value={[editingValue]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleSliderChange}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={handleSaveAllocation}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
