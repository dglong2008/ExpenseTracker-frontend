import { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api/api';
import { NotificationContext } from '../contexts/NotificationContext';
import Input from './Input';
import Select from './Select';
import Button from './Button';

export default function ExpenseForm({ onExpenseAdded }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useContext(NotificationContext);

    // Form state defaults
    const [formData, setFormData] = useState({
        value: '',
        date: new Date().toISOString().split('T')[0], // Defaults to today: YYYY-MM-DD
        note: '',
        category_id: ''
    });

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiFetch('/api/categories/');
                if (res && res.ok) {
                    const data = await res.json();
                    const formattedCategories = data.map(c => ({
                        value: c.category_id, // FIX: Changed from c.id to c.category_id
                        label: `${c.category_emoji} ${c.category_name}`
                    }));
                    setCategories(formattedCategories);
                }
            } catch (err) {
                showNotification('Failed to load categories.', 'error');
            }
        };
        fetchCategories();
    }, [showNotification]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                value: parseInt(formData.value, 10),
                category_id: parseInt(formData.category_id, 10)
            };

            // 1. LOG THE PAYLOAD: See exactly what React is sending to Python
            console.log("Sending payload to backend:", payload);

            const res = await apiFetch('/api/expenses/', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (res && res.ok) {
                showNotification('Expense added successfully!', 'success');
                setFormData({
                    value: '',
                    date: formData.date,
                    note: '',
                    category_id: ''
                });
                if (onExpenseAdded) onExpenseAdded();
            } else {
                // 2. LOG THE BACKEND ERROR: See exactly why Flask rejected it
                const errorData = await res.json();
                console.error("Backend rejected the request. Reason:", errorData);

                // Show the specific error message from your Flask backend if it exists
                showNotification(errorData.error || 'Failed to add expense.', 'error');
            }
        } catch (err) {
            // 3. LOG NETWORK ERRORS: E.g., CORS issues or server down
            console.error("Network or parsing error:", err);
            showNotification('A network error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="Amount (VND)"
                id="value"
                type="number"
                min="0"
                placeholder="e.g. 500000"
                required
                value={formData.value}
                onChange={handleChange}
            />
            <Select
                label="Category"
                id="category_id"
                required
                options={categories}
                value={formData.category_id}
                onChange={handleChange}
            />
            <Input
                label="Date"
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
            />
            <Input
                label="Note (Optional)"
                id="note"
                type="text"
                placeholder="What was this for?"
                value={formData.note}
                onChange={handleChange}
            />

            <div style={{ marginTop: '32px' }}>
                <Button type="submit" variant="orange" loading={loading}>
                    Add Expense
                </Button>
            </div>
        </form>
    );
}