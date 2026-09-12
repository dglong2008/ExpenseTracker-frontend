import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext';
import { apiFetch } from '../api/api';
import Input from '../components/Input';
import Button from '../components/Button';
import '../styles/auth.css';

export default function Signup() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiFetch('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Success! Please check your email to verify your account.', 'success');
                navigate('/login');
            } else {
                showNotification(data.error || 'Signup failed.', 'error');
            }
        } catch (error) {
            showNotification('A network error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Create Account.</h1>
                <p className="auth-subtitle">Join us to start managing your finances.</p>

                <form className="auth-form" onSubmit={handleSignup}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="First Name" id="first_name" required value={formData.first_name} onChange={handleChange} />
                        <Input label="Last Name" id="last_name" required value={formData.last_name} onChange={handleChange} />
                    </div>
                    <Input label="Email Address" id="email" type="email" required value={formData.email} onChange={handleChange} />
                    <Input label="Password" id="password" type="password" required value={formData.password} onChange={handleChange} />

                    <Button type="submit" loading={loading} variant="orange">
                        Sign Up
                    </Button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                </p>
            </div>
        </div>
    );
}