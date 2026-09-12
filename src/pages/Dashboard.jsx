import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';
import ExpenseForm from '../components/ExpenseForm';
import RightPanel from '../components/RightPanel';
import EditExpenseModal from '../components/EditExpenseModal'; // NEW
import '../styles/dashboard.css';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);

    const [refreshSignal, setRefreshSignal] = useState(0);

    // NEW: State to track which expense is currently being edited. 
    // If null, the modal is hidden.
    const [editingExpense, setEditingExpense] = useState(null);

    const handleDataRefresh = () => {
        setRefreshSignal(prev => prev + 1);
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense); // Opens the modal with this specific expense
    };

    const handleCloseModal = () => {
        setEditingExpense(null); // Closes the modal
    };

    const handleModalSuccess = () => {
        setEditingExpense(null); // Close modal on success
        handleDataRefresh();     // Force RightPanel to fetch updated data
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <aside>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                Hi, {user?.first_name} 👋
                            </h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                                Let's track your spending.
                            </p>
                        </div>
                        <div style={{ width: '80px' }}>
                            <Button variant="black" onClick={logout} style={{ padding: '8px', fontSize: '0.8rem' }}>
                                Logout
                            </Button>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2 className="card-title">New Expense</h2>
                        <ExpenseForm onExpenseAdded={handleDataRefresh} />
                    </div>
                </aside>

                <RightPanel
                    refreshKey={refreshSignal}
                    onEditRequest={handleEditExpense}
                />
            </div>

            {/* Conditionally render the Edit Modal if editingExpense is not null */}
            {editingExpense && (
                <EditExpenseModal
                    expense={editingExpense}
                    onClose={handleCloseModal}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
}