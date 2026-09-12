import { useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatVND } from '../utils/formatters';

// Our strict design system color palette
const COLORS = ['#FF7A00', '#8B5CF6', '#111827', '#6B7280', '#E66A00'];

// The custom function that draws a larger ring and text when a slice is hovered
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#111827" fontSize="1.25rem" fontWeight="700">
                {payload.category_emoji} {payload.category_name}
            </text>
            <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill="#6B7280" fontSize="0.875rem">
                {formatVND(value)}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8} // Expands outward on hover
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 12}
                outerRadius={outerRadius + 16}
                fill={fill}
            />
        </g>
    );
};

export default function DonutChart({ data, grandTotal }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '64px' }}>No expenses for this period.</div>;
    }

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Constrain the chart height explicitly to 320px */}
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={data}
                            innerRadius={90}
                            outerRadius={120}
                            dataKey="total_value"
                            onMouseEnter={onPieEnter}
                            animationDuration={400}     // Speeds up the entry animation (400ms)
                            animationEasing="linear"    // Removes the slow-motion easing at the end
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Grand Total</h3>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-orange)' }}>
                    {formatVND(grandTotal)}
                </p>
            </div>
        </div>
    );
}