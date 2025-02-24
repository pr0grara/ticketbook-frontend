import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { prepareContextForAI } from "../hooks/useStateHelper";
import useAPI from "../hooks/useAPI.js";
import { handleAIRequest } from "../hooks/useAI.js";
import DailyPlan from "./DailyPlan.jsx";
import { parseAIResponse } from '../hooks/useAI.js';
import { logInteraction } from "../../redux/slices/aiMemorySlice.js";

function AICanvas({ from }) {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const tickets = useSelector(state => state.tickets.tickets);
    const selectedTickets = useSelector(state => state.tickets.selectedTickets);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    const goals = useSelector(state => state.goals);
    const userId = useSelector(state => state.user ? state.user.id : null);
    const aiHistory = useSelector(state => state.ai);

    const [aiResponse, setAiResponse] = useState("");
    const [userInput, setUserInput] = useState("");
    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        console.log("conversation history changed", conversation)
    }, [conversation])

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        
        const requestType = "user message";
        let contextTickets = [];
        if (tickets.length > 0) contextTickets = selectedTickets.length > 0 ? selectedTickets : tickets;

        try {
            let contextGoals = !!selectedGoal ? [selectedGoal] : goals;
            
            const res = await handleAIRequest({ requestType, contextGoals, contextTickets, userInput, conversation, from, aiHistory, userId })//send request to backend
            const parsedResponse = await parseAIResponse(res);//parse backend request
            dispatch(logInteraction({userMessage: userInput, aiResponse: parsedResponse}))//add interaction to redux state
            
            setAiResponse(prev => prev + "\n" + parsedResponse);
            conversation.push({ "role": "user", "content": userInput })
            conversation.push({ "role": "system", "content": parsedResponse })
            setConversation(conversation);
            setUserInput("");
        } catch (err) {
            console.error("AI error:", err);
            setAiResponse(prev => prev + "\n⚠️ AI service is currently unavailable.");
        }
    };

    return (
        <div className="ai-canvas">
            <div className="ai-output">
                {aiResponse ? aiResponse.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                )) : <p className="placeholder">Ask AI for help related to your goals...</p>}
            </div>
            <form className="ai-input" onSubmit={handleAiSubmit} tickets={tickets} data-from={from}> 
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your request..."
                />
                <button type="submit">Send</button>
            </form>
            <button onClick={() => navigate('/plan')} >📝 Generate Daily Plan</button>
        </div>
    );
}

export default AICanvas;