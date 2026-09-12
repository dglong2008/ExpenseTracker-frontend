import { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api/api';
import { NotificationContext } from '../contexts/NotificationContext';
import DonutChart from './DonutChart';
import Select from './Select';
import { formatVND } from '../utils/formatters';
import '../styles/right-panel.css';

export default function RightPanel({ refreshKey, onEditRequest }) {
    const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'list'

    // Default to current Month and Year
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [categories, setCategories] = useState([]);

    const [chartData, setChartData] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true);

    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all three endpoints at once
                const [chartRes, listRes, catRes] = await Promise.all([
                    apiFetch(`/api/expenses/analytics/donut?month=${month}&year=${year}`),
                    apiFetch(`/api/expenses/?month=${month}&year=${year}`),
                    apiFetch('/api/categories/') // New fetch
                ]);

                if (chartRes.ok && listRes.ok && catRes.ok) {
                    const chartJson = await chartRes.json();
                    const listJson = await listRes.json();
                    const catJson = await catRes.json();

                    setChartData(chartJson.chart_data || []);
                    setGrandTotal(chartJson.grand_total || 0);
                    setCategories(catJson || []);

                    const sortedList = (listJson || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                    setListData(sortedList);
                }
            } catch (error) {
                showNotification('Failed to fetch data for this period.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month, year, refreshKey, showNotification]);

    return (
        <main className="dashboard-card" style={{ minHeight: '600px' }}>

            {/* Header: Tabs and Date Controls */}
            <div className="panel-header">
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chart')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        All Expenses
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
                    <Select
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Month ${i + 1}` }))}
                    />
                    <Select
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        options={[2025, 2026, 2027].map(y => ({ value: y, label: y }))}
                    />
                </div>
            </div>

            {/* Body: Conditional Rendering based on activeTab */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>Loading data...</div>
            ) : activeTab === 'chart' ? (
                <DonutChart data={chartData} grandTotal={grandTotal} />
            ) : (
                <div className="expense-list">
                    {listData.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No expenses recorded.</p>
                    ) : (
                        listData.map((expense) => {
                            // Look up the category visuals matching this expense
                            const category = categories.find(c => c.category_id === expense.category_id);

                            return (
                                <div key={expense.expense_id} className="expense-row">
                                    <div>
                                        <div style={{ fontWeight: '600' }}>
                                            {category ? category.category_emoji : '📄'} {category ? category.category_name : 'Expense'}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {new Date(expense.date).toLocaleDateString()} • {expense.note || 'No note'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--primary-black)' }}>
                                            {formatVND(expense.value)}
                                        </div>
                                        <button className="edit-btn" onClick={() => onEditRequest(expense)}>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </main>
    );
}