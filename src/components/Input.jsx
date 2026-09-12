import '../styles/components.css';

export default function Input({ label, id, ...props }) {
    return (
        <div className="input-group">
            <label htmlFor={id} className="input-label">
                {label}
            </label>
            <input id={id} className="input-field" {...props} />
        </div>
    );
}