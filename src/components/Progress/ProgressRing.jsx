import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProgressRing({ type, tickets = [], onClick, forRoutine }) {
    const navigate = useNavigate();
    const label = type.charAt(0).toUpperCase() + type.slice(1); // e.g., "Daily"

    const filtered = forRoutine ? tickets.filter(t => t.isRecurring === type) : tickets;
    const total = filtered.length;
    const completed = filtered.filter(t => t.status === "done").length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div
            className="progress-ring-container"
            onClick={onClick || (() => navigate('/routine'))}
        >
            <svg
                height={radius * 2}
                width={radius * 2}
                className="progress-ring"
            >
                <circle
                    stroke="#e0e0e0"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#4caf50"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference + " " + circumference}
                    strokeDashoffset={strokeDashoffset}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="progress-ring__circle"
                />
            </svg>
            <div className="progress-ring-text">
                {completed}/{total}
            </div>
            <div className="progress-ring-label">{label} Routine</div>
        </div>
    );
}