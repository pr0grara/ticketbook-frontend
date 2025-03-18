import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleAIRequest, handleAIResponse } from "../hooks/useAI.js";
import { logInteraction } from "../../redux/slices/aiMemorySlice.js";
import { Send, Loader, ChevronDown, ChevronUp } from "lucide-react";
import { setIsLoading } from "../../redux/slices/sessionSlice.js";
import { darkMode } from "../../util/theme_util.js";

function AICanvas({ from }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isExpanded, setIsExpanded] = useState(false);
    // const [isLoading, setIsLoading] = useState(false); // ✅ Track AI processing
    const { isLoading } = useSelector(state => state.session);

    const dispatch = useDispatch();
    const tickets = useSelector(state => state.tickets.tickets);
    const selectedTickets = useSelector(state => state.tickets.selectedTickets);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    const goals = useSelector(state => state.goals);
    const userId = useSelector(state => state.userId);
    const aiHistory = useSelector(state => state.ai);
    const { externalInteractions } = useSelector(state => state.ai);
    const { theme } = useSelector(state => state.session);

    const [aiResponse, setAiResponse] = useState("");
    const [userInput, setUserInput] = useState("");
    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        const newAdvice = externalInteractions[0]?.aiResponse.advice;
        if (!!newAdvice) {
            setAiResponse(prev => prev + "\n" + newAdvice);
            if (!isExpanded) setIsExpanded(true)
            setConversation(prev => [...prev, { role: "system", content: newAdvice }]);
        }
    }, [externalInteractions]);

    useEffect(() => {
        const handleResizeListener = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResizeListener);
        return () => window.removeEventListener("resize", handleResizeListener);
    }, []);

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        dispatch(setIsLoading(true)); // Show loading animation

        const requestType = "user message";
        let contextTickets = [];
        if (tickets.length > 0) contextTickets = selectedTickets.length > 0 ? selectedTickets : tickets;

        try {
            let contextGoals = !!selectedGoal ? [selectedGoal] : goals.goals;
            //Send request to backend
            const aiResponse = await handleAIRequest({ requestType, contextGoals, contextTickets, userInput, conversation, from, aiHistory, userId });
            //Handle response
            const handledResponse = await handleAIResponse(aiResponse);
            //Update React/Redux
            dispatch(logInteraction({ userMessage: userInput, aiResponse: handledResponse }));
            setAiResponse(prev => prev + "\n" + handledResponse);
            setConversation(prev => [
                ...prev,
                { role: "user", content: userInput },
                { role: "system", content: handledResponse }
            ]);
            setUserInput("");
        } catch (err) {
            console.error("AI error:", err);
            setAiResponse(prev => prev + "\n⚠️ AI service is currently unavailable.");
        } finally {
            if (!isExpanded) setIsExpanded(true);
            dispatch(setIsLoading(false)); // ✅ Hide loading animation
            document.querySelector('.canvas-input').blur()
        }
    };

    return (
        <div className={`ai-canvas${isMobile ? (isExpanded ? " expanded" : " collapsed") : ""}${darkMode(theme) ? " dark-mode-canvas" : ""}`}>
            {isMobile && (
            <button className="toggle-ai-btn" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
            )}
            {(!isMobile || isExpanded) && (
                <div className="ai-output">
                    {aiResponse ? aiResponse.split("\n").map((line, index) => (
                        <p key={index}>{line}</p>
                    )) : <p className="placeholder">Create new goals, add tickets, ask me for advice...</p>}
                </div>
            )}
            <form className="ai-input" onSubmit={handleAiSubmit} tickets={tickets} data-from={from}>
                <input
                    type="text"
                    value={userInput}
                    className="canvas-input"
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your request..."
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader className="loading-icon" /> : <Send className="send-icon" />}
                </button>
            </form>
        </div>
    );
}

export default AICanvas;