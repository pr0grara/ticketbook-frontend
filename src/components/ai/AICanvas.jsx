import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleAIRequest, handleAIResponse } from "../hooks/useAI.js";
import { logInteraction } from "../../redux/slices/aiMemorySlice.js";
import { Send, Loader, ChevronDown, ChevronUp, ArrowUp, X } from "lucide-react";
import { setIsLoading } from "../../redux/slices/sessionSlice.js";
import { darkMode } from "../../util/theme_util.js";

function AICanvas({ from }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isExpanded, setIsExpanded] = useState(false);
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

    const [userInput, setUserInput] = useState("");
    const [conversation, setConversation] = useState(() => {
        const stored = localStorage.getItem("ai_conversation");
        return stored ? JSON.parse(stored) : [];
    });
    const [typingIndex, setTypingIndex] = useState(0);
    const [displayedContent, setDisplayedContent] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [shortcuts, setShortcuts] = useState({"New Ticket": false, "New Goal": false, "New Bucket": false});

    useEffect(() => {
        const newAdvice = externalInteractions[0]?.aiResponse.advice;
        if (!!newAdvice) {
            if (!isExpanded) setIsExpanded(true);
            setConversation(prev => {
                const updated = [...prev, { role: "system", content: newAdvice }];
                localStorage.setItem("ai_conversation", JSON.stringify(updated));
                return updated;
            });
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

        dispatch(setIsLoading(true));
        document.querySelector('.canvas-input').blur();

        const requestType = "user message";
        let contextTickets = tickets.length > 0 ? (selectedTickets.length > 0 ? selectedTickets : tickets) : [];
        let contextGoals = !!selectedGoal ? [selectedGoal] : goals.goals;
        
        
        try {
            // 🔐 This is the first payload sent towards backend AI — do not mutate structure lightly.
            const request = { 
                requestType, 
                contextGoals, 
                contextTickets, 
                userInput, 
                conversation, 
                from, 
                aiHistory, 
                userId,
                shortcuts,
             }

            const aiResponse = await handleAIRequest(request);
            const handledResponse = await handleAIResponse(aiResponse);

            dispatch(logInteraction({ userMessage: userInput, aiResponse: handledResponse }));

            setConversation(prev => {
                const updated = [...prev, { role: "user", content: userInput }];
                localStorage.setItem("ai_conversation", JSON.stringify(updated));
                return updated;
            });

            setDisplayedContent("");
            setTypingIndex(0);
            setIsTyping(true);

            let i = 0;
            let output = "";

            const typingInterval = setInterval(() => {
                if (i < handledResponse.length) {
                    output += handledResponse[i];
                    setDisplayedContent(output); // full output so far
                    i++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                    setConversation(prev => {
                        const updated = [...prev, { role: "system", content: handledResponse }];
                        localStorage.setItem("ai_conversation", JSON.stringify(updated));
                        return updated;
                    });
                }
            }, 20);

            setUserInput("");
        } catch (err) {
            console.error("AI error:", err);
            const errorMsg = "\u26A0\uFE0F AI service is currently unavailable.";
            setConversation(prev => {
                const updated = [...prev, { role: "system", content: errorMsg }];
                localStorage.setItem("ai_conversation", JSON.stringify(updated));
                return updated;
            });
        } finally {
            if (!isExpanded) setIsExpanded(true);
            setShortcuts({ "New Ticket": false, "New Goal": false, "New Bucket": false })
            dispatch(setIsLoading(false));
        }
    };

    const clearConversation = () => {
        setConversation([]);
        localStorage.removeItem("ai_conversation");
    };

    return (
        <div className={`ai-canvas${isMobile ? (isExpanded ? " expanded" : " collapsed") : ""}${darkMode(theme) ? " dark-mode" : ""}`}>
            {(!isMobile || isExpanded) && <div className="shortcut-buttons-container">
                {Object.keys(shortcuts).map((shortcut, idx) => (
                    <div 
                    key={idx} 
                    className={`shortcut-button${shortcuts[shortcut] ? " selected" : ""}`}
                    onClick={() => {
                        setShortcuts((prev) => {
                            const isAlreadyActive = prev[shortcut];
                            const updated = Object.fromEntries(
                                Object.keys(prev).map((key) => [key, false])
                            );
                            if (!isAlreadyActive) updated[shortcut] = true;
                            return updated;
                        });
                    }}
                    >
                        {shortcut}
                    </div>
                ))}
            </div>}
            {(conversation.length > 0 && (!isMobile || isExpanded)) && (
                <button
                    title="clear chat history"
                    className="clear-chat-top"
                    onClick={clearConversation}
                    aria-label="Clear conversation"
                >
                    <X size={14} />
                </button>
            )}
            {isMobile && isExpanded && (
                <button className="toggle-ai-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={18} />}
                </button>
            )}
            {(!isMobile || isExpanded) && (
                <div className="ai-output">
                    {conversation.map((msg, index) => (
                        <div key={index} className={msg.role === "user" ? "user-message" : "ai-message"}>
                            {msg.content.split("\n").map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="ai-message typing">
                            {displayedContent.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                            <span className="blinking-cursor">|</span>
                        </div>
                    )}
                </div>
            )}
            <form className="ai-input" onSubmit={handleAiSubmit} tickets={tickets} data-from={from} onClick={() => setIsExpanded(true)}>
                <input
                    type="text"
                    value={userInput}
                    className="canvas-input"
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your request..."
                />
                {(!isMobile || isExpanded) && (
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader className="loading-icon" /> : <ArrowUp size={18} className="send-icon" />}
                    </button>
                )}
            </form>
        </div>
    );
}

export default AICanvas;