import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleAIRequest, parseAIResponse } from "../hooks/useAI.js";
import { logInteraction } from "../../redux/slices/aiMemorySlice.js";

function AICanvas({ from }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();
    const tickets = useSelector(state => state.tickets.tickets);
    const selectedTickets = useSelector(state => state.tickets.selectedTickets);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    const goals = useSelector(state => state.goals);
    const userId = useSelector(state => state.user ? state.user.id : null);
    const aiHistory = useSelector(state => state.ai);

    const [aiResponse, setAiResponse] = useState("");
    const [userInput, setUserInput] = useState("");
    const [conversation, setConversation] = useState([]);

    // useEffect(() => {
    //     console.log("conversation history changed", conversation)
    // }, [conversation])

    useEffect(() => {
        console.log("🔄 AICanvas Component Re-Rendered");
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        
        const requestType = "user message";
        let contextTickets = [];
        if (tickets.length > 0) contextTickets = selectedTickets.length > 0 ? selectedTickets : tickets;

        try {
            let contextGoals = !!selectedGoal ? [selectedGoal] : goals.goals;
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
        <div className={`ai-canvas ${isMobile ? (isExpanded ? " expanded" : "collapsed") : ""}`}>
            {isMobile && (
                <button className="toggle-ai-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? "Hide AI" : "Show AI 🤖"}
                </button>
            )}
            {(!isMobile || isExpanded) && (
                <div className="ai-output">
                    {aiResponse ? aiResponse.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    )) : <p className="placeholder">Ask AI for help related to your goals...</p>}
                </div>
            )}
            <form className="ai-input" onSubmit={handleAiSubmit} tickets={tickets} data-from={from}> 
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your request..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default AICanvas;