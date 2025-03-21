import { useDragLayer } from "react-dnd";

const DragPreview = () => {
    const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    if (!isDragging || !currentOffset) return null;

    return (
        <div
            className="ticket-preview"
            style={{
                position: "fixed",
                pointerEvents: "none",
                top: currentOffset.y,
                left: currentOffset.x,
                // transform: "translate(-50%, -50%)",
                zIndex: 9999,
            }}
        >
            {item.isMobile && <div className="ticket-card ghosted">{item.ticket.title}</div>}
        </div>
    );
};

export default DragPreview;