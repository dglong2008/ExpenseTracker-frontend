import { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api/api';
import { NotificationContext } from '../contexts/NotificationContext';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import '../styles/modal.css';

export default function EditExpenseModal({ expense, onClose, onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize form with the passed-in expense data
    const [formData, setFormData] = useState({
        value: expense.value || '',
        // Ensure date is perfectly formatted for the HTML input (YYYY-MM-DD)
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
        note: expense.note || '',
        category_id: expense.category_id || (expense.category?.id) || ''
    });

    const { showNotification } = useContext(NotificationContext);

    // Fetch categories so the user can change the category of the expense
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiFetch('/api/categories/');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.map(c => ({
                        value: c.category_id, // FIX: Changed from c.id to c.category_id
                        label: `${c.category_emoji} ${c.category_name}`
                    })));
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                value: parseInt(formData.value, 10),
                category_id: parseInt(formData.category_id, 10)
            };

            // Note: Assuming standard REST conventions where the ID is passed in the URL.
            // If your Flask backend expects the ID in the body, add `id: expense.id` to the payload.
            const res = await apiFetch(`/api/expenses/${expense.expense_id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showNotification('Expense updated!', 'success');
                onSuccess(); // Triggers the dashboard refresh
            } else {
                const errData = await res.json();
                showNotification(errData.msg || 'Failed to update expense.', 'error');
            }
        } catch (err) {
            showNotification('A network error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        setLoading(true);
        try {
            const res = await apiFetch(`/api/expenses/${expense.expense_id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showNotification('Expense deleted.', 'success');
                onSuccess();
            } else {
                showNotification('Failed to delete expense.', 'error');
            }
        } catch (err) {
            showNotification('A network error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* e.stopPropagation() prevents clicking inside the card from closing the modal */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Expense</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleUpdate}>
                    <Input
                        label="Amount (VND)"
                        id="value"
                        type="number"
                        min="0"
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
                        value={formData.note}
                        onChange={handleChange}
                    />

                    <div className="modal-actions">
                        <Button type="button" variant="black" onClick={handleDelete} loading={loading} style={{ backgroundColor: '#EF4444' }}>
                            Delete
                        </Button>
                        <Button type="submit" variant="orange" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}