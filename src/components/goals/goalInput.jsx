import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const categories = ["Personal Growth", "Career", "Health & Fitness", "Finance", "Learning"];

const userId = "6778de261a642d64cc04996a"; // Placeholder User ID

function GoalInput({ onGoalAdded }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(categories[0]); // Default first category
    const [priority, setPriority] = useState(50); // Default priority (mid-point)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newGoal = { userId, title, description, category, priority };

        try {
            const res = await axios.post(`${API_BASE_URL}/goals/new`, newGoal);
            onGoalAdded(res.data); // Notify parent to update list
            setTitle(""); setDescription(""); setPriority(50);
        } catch (err) {
            console.error("Error adding goal:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="goal-form">
            <input
                type="text"
                placeholder="Goal Title"
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <textarea
                placeholder="Describe your goal..."
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <label>Priority: {priority}</label>
            <input
                type="range"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
            />

            <button type="submit">➕ Add Goal</button>
        </form>
    );
}

export default GoalInput;