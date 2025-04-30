import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleAIRequest, handleAIResponse } from "../hooks/useAI.js";
import { logInteraction } from "../../redux/slices/aiMemorySlice.js";
import { Send, Loader, ChevronDown, ChevronUp, ArrowUp, X, CirclePlus, TicketPlus, PackagePlus, MessageCirclePlus } from "lucide-react";
import { setIsLoading } from "../../redux/slices/sessionSlice.js";
import { darkMode } from "../../util/theme_util.js";
import CanvasPopup from "./CanvasPopup.jsx";
import authAPI from "../api/authAPI.js";
import { setPopup } from "../../redux/slices/canvasSlice.js";

function AICanvas({ from, placeholderIdx }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isExpanded, setIsExpanded] = useState(false);
    const { isLoading } = useSelector(state => state.session);

    const dispatch = useDispatch();
    const tickets = useSelector(state => state.tickets.tickets);
    const selectedTickets = useSelector(state => state.tickets.selectedTickets);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    const goals = useSelector(state => state.goals);
    const { userId } = useSelector(state => state.user);
    const aiHistory = useSelector(state => state.ai);
    const { externalInteractions } = useSelector(state => state.ai);
    const { theme } = useSelector(state => state.session);
    const { popup } = useSelector(state => state.canvas);

    const [userInput, setUserInput] = useState("");
    const [conversation, setConversation] = useState(() => {
        const stored = localStorage.getItem("ai_conversation");
        return stored ? JSON.parse(stored) : [];
    });
    const [typingIndex, setTypingIndex] = useState(0);
    const [displayedContent, setDisplayedContent] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [shortcuts, setShortcuts] = useState({"New Ticket": false, "New Goal": false, "New Bucket": false});
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const [rows, setRows] = useState(1);
    const [inputLength, setInputLength] = useState(0);
    const [charsPerRow, setCharsPerRow] = useState(0);
    const [quickcut, setQuickcut] = useState('');
    const [feedback, setFeedback] = useState(false);

    const scrollRef = useRef(null);
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (autoScrollEnabled && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation, displayedContent, autoScrollEnabled]);

    useEffect(() => {
        const el = outputRef.current;
        if (!el) return;
        const SCROLL_THRESHOLD = 1; // pixels from bottom to count as "near bottom"


        const handleScroll = () => {
            // setTimeout(() => {
                let scrollOffset = 0;
                scrollOffset = el.scrollHeight - el.scrollTop - el.clientHeight;
                const awayFromBottom = scrollOffset > SCROLL_THRESHOLD;
                console.log(scrollOffset)
                console.log(isTyping)
                if (awayFromBottom) {
                    setAutoScrollEnabled(false);
                } else {
                    // debugger
                    setAutoScrollEnabled(true);
                }
            // }, 50); // Delay gives browser time to update scrollTop
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

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

        if (feedback) {
            authAPI.post('/users/feedback', {
                // userId,
                userFeedback: userInput
            })
            setIsTyping(true)
            setDisplayedContent('Thanks for the feedbizzie 🫡');
            setUserInput('');
            setTimeout(() => setIsTyping(false), 3000)
            setFeedback(false)
            return;
        }

        dispatch(setIsLoading(true));
        document.querySelector('.canvas-input').blur();

        const requestType = "user message";
        let contextTickets = tickets.length > 0 ? (selectedTickets.length > 0 ? selectedTickets : tickets) : [];
        // //Only send open tickets to backend
        // contextTickets = contextTickets.filter(tick => tick.status !== "done");
        let contextGoals = !!selectedGoal ? [selectedGoal] : goals.goals;
        
        try {
            // let input = userInput;
            // input = input.replace('/newticket ', '').replace('/newgoal ', '').replace('/newbucket ', '')
            // 🔐 This is the first payload sent towards backend AI — do not mutate structure lightly.
            const request = { 
                requestType, 
                contextGoals, 
                contextTickets, 
                // userInput: input, 
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
            setRows(1);
            setTypingIndex(0);
            setIsTyping(true);
            setAutoScrollEnabled(true);

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
            if (!isMobile) document.querySelector('.canvas-connector-svg').style.display = 'none';
            dispatch(setPopup(false));
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

    const setShortcutIcon = (shortcut) => {
        switch (shortcut) {
            case "New Ticket":
                return <TicketPlus />;
            case "New Goal":
                return <CirclePlus />;
            case "New Bucket":
                return <PackagePlus />;
            case "feedback":
                return <MessageCirclePlus />;
            default:
                break
        }
    }

    const handleChange = (e) => {
        const el = inputRef.current;
        let rows = Math.floor(el.scrollHeight / (isMobile ? 20 : 35));
        if (el.value.length === 0) rows = 1;
        if (!charsPerRow && rows === 2) {
            setCharsPerRow(Math.floor(el.value.length * 1.1))
        };
        if (!!charsPerRow && (el.value.length < inputLength)) {
            let newRowCount = Math.ceil(inputLength / charsPerRow) + 1
            rows = newRowCount > rows ? rows : newRowCount;
        }
        setInputLength(el.value.length)
        setRows(rows);

        const input = e.target.value;
        const activeShortcut = Object.keys(shortcuts).find(key => shortcuts[key]);
        const expectedPrefix = activeShortcut ? `/${activeShortcut.toLowerCase().replace(" ", "")} ` : "";
        console.log(expectedPrefix)
        // If user is deleting the prefix OR manually modifying it
        // console.log(activeShortcut, (!input.startsWith(expectedPrefix) || input.length < expectedPrefix.length))

        if (
            !!activeShortcut && !!userInput &&
            (!input.startsWith(expectedPrefix) || input.length < expectedPrefix.length)
        ) {
            setShortcuts({ "New Ticket": false, "New Goal": false, "New Bucket": false });
            return setUserInput('')
        }

        if (expectedPrefix && !input.startsWith(expectedPrefix)) {
            setUserInput(expectedPrefix + input);
        } else {
            setUserInput(input);
        }    
    };

    const placeholders = [
        "/newgoal I want to get better at cooking",
        "/newticket follow up with Tara about art show",
        "Make me a new bucket to keep track of my widget business",
        "Make me a shopping list for chicken katsu",
        "What do I need to make an old fashioned?",
        "I need to make 50 widgets by Friday",
        "/newgoal Learn basic Spanish for travel",
        "/newticket Schedule a call with Jake about the deck",
        "/newbucket crypto",
        "Plan menu for bbq dinner party",
        "What's the process for renewing my passport?",
        "Remind me to send invoices before the 10th",
        "/newgoal Start running 3 times a week",
        "/newticket Ask Ngoc about the updated branding",
        "Make me a new bucket for podcast episode ideas",
        "Plan a meal prep list for the week",
        "Send thank you emails to all new customers today",
        "Add a reminder to cancel my trial subscription",
        "Make packing list for 3 day camping trip in Sierra's",
        "/newticket Bring amazon package in for Troy",
        "What are the steps to register an LLC in California?"
    ];

    const feedbackPlaceholders = [
        'Anything frustrating?',
        'Something annoying?',
        'Do you like something?',
        "or don't idc",
        '',
        'Steps slowing you down?',
        'Suggestion?',
        'Suggestion?',
        'Comment?',
    ]

    return (
        <div className={`ai-canvas${isMobile ? (isExpanded ? " expanded" : " collapsed") : ""}${darkMode(theme) ? " dark-mode" : ""}`}>
            {isMobile && isExpanded && (
                <button className="toggle-ai-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={18} />}
                </button>
            )}
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
            {(!isMobile || isExpanded) && (
                <div className="ai-output" ref={outputRef} onTouchStart={()=>!!isTyping && setAutoScrollEnabled(false)}>
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
                    {/* {!autoScrollEnabled && (
                        <button className="scroll-to-bottom" onClick={() => {
                            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
                            setAutoScrollEnabled(true);
                        }}>
                            <ChevronDown />
                        </button>
                    )} */}
                    <div ref={scrollRef} />
                </div>
            )}
            {popup && <CanvasPopup type={popup} goalObjs={goals} />}
            {!isMobile && <svg className="canvas-connector-svg" >
                <path className="canvas-connector-path" fill='none'/>
            </svg>}
            <form className="ai-input" onSubmit={handleAiSubmit} data-from={from} onClick={() => setIsExpanded(true)}>
                <textarea
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    className="canvas-input"
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                handleAiSubmit(e);
                            } else setRows(rows + 1)
                        }
                    }}
                    // placeholder={feedback ? "Test " + feedbackPlaceholders[Math.floor(feedbackPlaceholders.length * Math.random())] : placeholders[placeholderIdx]}
                    placeholder={feedback ? `Annonymous feedback... 
    ${feedbackPlaceholders[Math.floor(feedbackPlaceholders.length * Math.random())]}` : placeholders[placeholderIdx]}
                    rows={rows}
                />
                {(!isMobile || isExpanded) && (
                    <div className="submit-container">
                        <div className="shortcut-buttons-container">
                            {Object.keys(shortcuts).map((shortcut, idx) => (
                                <div
                                    key={idx}
                                    className={`shortcut-button${(shortcuts[shortcut] && !feedback) ? " selected" : ""}`}
                                    onClick={() => {
                                        setShortcuts((prev) => {
                                            if (feedback) setFeedback(false);
                                            const isAlreadyActive = prev[shortcut];
                                            const updated = Object.fromEntries(
                                                Object.keys(prev).map((key) => [key, false])
                                            );
                                            //START UPDATE USER INPUT FIELD ON SHORTCUT ACTIVATION
                                            const prevActive = Object.keys(prev).filter(cut => !!prev[cut])
                                            if (!!prevActive.length && !isAlreadyActive && !!userInput) {
                                                let humanInput = userInput.split(`/${prevActive[0].toLowerCase().replace(" ", "")} `)[1];
                                                setUserInput(`/${shortcut.toLowerCase().replace(" ", "")} ${humanInput}`)
                                            } else if (!!prevActive.length && !!isAlreadyActive && !!userInput) {
                                                let humanInput = userInput.split(`/${prevActive[0].toLowerCase().replace(" ", "")} `)[1];
                                                setUserInput(humanInput)
                                            } else if (!!prevActive.length && !isAlreadyActive && !userInput) {
                                                setUserInput(`/${shortcut.toLowerCase().replace(" ", "")} ${userInput.replace(prevActive, '').join('')}`)
                                            } else {
                                                setUserInput(`/${shortcut.toLowerCase().replace(" ", "")} ${userInput}`)
                                            }
                                            //END UPDATE USER INPUT FIELD ON SHORTCUT ACTIVATION
                                            if (!isAlreadyActive) updated[shortcut] = true;
                                            if (updated['New Ticket'] && !selectedGoal) {
                                                dispatch(setPopup("SPECIFY_GOAL_FOR_TICKET"))
                                                if (!isMobile) document.querySelector('.canvas-connector-svg').style.display = 'unset'
                                            } else if (!updated['New Ticket'] && popup) {
                                                dispatch(setPopup(false))
                                                if (!isMobile) document.querySelector('.canvas-connector-svg').style.display = 'none'
                                            }
                                            return updated;
                                        });
                                        document.querySelector('.canvas-input').focus()
                                    }}
                                >
                                    {setShortcutIcon(shortcut)}
                                    {(!isMobile || shortcuts[shortcut]) ? <span>{shortcut}</span> : ""}
                                </div>
                            ))}
                        </div>
                        <div className="ai-submit-container">
                            <div 
                                className={`shortcut-button${!!feedback ? " selected" : ""}`}
                                onClick={() => {
                                    // debugger
                                    const shortkeys = ['New Ticket', 'New Goal', 'New Bucket'];
                                    if (shortkeys.some(key => shortcuts[key])) setUserInput('');
                                    setShortcuts({ "New Ticket": false, "New Goal": false, "New Bucket": false })
                                    setFeedback(!feedback)
                                    document.querySelector('.canvas-input').focus();
                                }}
                                >
                                {(feedback) ? <span>feedback&nbsp;</span> : ""}
                                {setShortcutIcon("feedback")}
                            </div>
                            {(!isMobile || isExpanded) && <button type="submit" className="ai-submit-button" disabled={isLoading}>
                                {isLoading ? <Loader className="loading-icon" /> : <ArrowUp size={18} className="send-icon" />}
                            </button>}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

export default AICanvas;