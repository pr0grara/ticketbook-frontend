import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, position }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.classList.remove('no-scroll');
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalStyle = {
        top: position?.y || '50%',
        // left: position?.x || '50%',
        transform: position ? 'translate(0, 0)' : 'translate(-50%, -50%)',
    };

    console.log(modalStyle)

    return (
        <div className="modal-overlay" onClick={onClose} style={modalStyle}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {title && <h2 className="modal-title">{title}</h2>}
                <div className="modal-body">
                    {children}
                </div>
                <button className="modal-close" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}