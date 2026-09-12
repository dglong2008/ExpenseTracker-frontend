import '../styles/components.css';

export default function Button({ children, variant = 'black', loading, ...props }) {
    return (
        <button
            className={`btn btn-${variant}`}
            disabled={loading}
            {...props}
        >
            {loading ? 'Processing...' : children}
        </button>
    );
}