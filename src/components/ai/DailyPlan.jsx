import { useEffect, useState } from "react";
import useAPI from "../hooks/useAPI";
import { useSelector } from "react-redux";
import { handleAIRequest } from "../hooks/useAI";
// import useAI from '../hooks/useAI';

function DailyPlan() {
    const tickets = useSelector(state => state.tickets.tickets);
    const selectedTickets = useSelector(state => state.tickets.selectedTickets);

    const goals = useSelector(state => state.goals.goals);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);

    const userId = useSelector(state => state.userId);
    const aiHistory = useSelector(state => state.ai);

    const { generateDailyPlan, confirmDailyPlan } = useAPI(userId, selectedGoal);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [aiPlan, setAiPlan] = useState(null)

    useEffect(() => {
        console.log("🔄 Daily Plan Component Re-Rendered");
    });

    const handleAiPlan = () => {
        console.log("generating daily plan")
        // handleAIRequest("prioritize", selectedGoal, tickets).then(setDailyPlan);
        // generateDailyPlan(selectedGoal).then(setDailyPlan);
        const requestType = "daily plan";
        let contextTickets = selectedTickets.length > 0 ? selectedTickets : tickets;
        let contextGoals = !!selectedGoal ? [selectedGoal] : goals;

        if (!selectedGoal && goals) handleAIRequest({ requestType, contextGoals, contextTickets, aiHistory }).then(plan => {
            setAiPlan(plan)
        })

        if (selectedGoal && goals) handleAIRequest({ requestType, contextGoals, contextTickets, aiHistory }).then(plan => {
            setAiPlan(plan)
        })
    }

    useEffect(() => {
        console.log("🔥 Current aiPlan:", aiPlan, typeof aiPlan);
        if (aiPlan === null) console.log("✅ aiPlan is NULL");
    }, [aiPlan])

    return (
        <div className="daily-plan">
            <h3>Daily Plan</h3>
            <button onClick={() => handleAiPlan()}>Suggest a plan?</button>
            {aiPlan !== null && Object.keys(aiPlan || {}).length > 0 ? (
                <ul>
                    {Object.entries(aiPlan).map(([timeSlot, tasks]) => (
                        <li key={timeSlot}>
                            <strong>{timeSlot}:</strong>
                            <ul>
                                {tasks.map((task, index) => (
                                    <>
                                        <li key={index} data-id={task.id} >{task.ticket}</li>
                                        <div key={"advice-" + index}>{task.advice}</div>
                                        <div className="time-estimate" key={"time-" + {index}}>{task.time}</div>
                                    </>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading AI suggestions...</p>
            )}
            <button onClick={() => confirmDailyPlan(aiPlan)}>✔ Confirm Plan</button>
        </div>
    );
}

export default DailyPlan;