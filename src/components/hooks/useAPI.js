import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGoals, removeGoal } from "../../redux/slices/goalsSlice";
import { logFromExternal } from "../../redux/slices/aiMemorySlice";
import { setIsLoading } from "../../redux/slices/sessionSlice";
import { handleAIRequest } from "./useAI";
import { updateTicketStatus, removeTicket, setUserActivatedTickets, clearUserActivatedTickets } from "../../redux/slices/ticketsSlice";
import { API_BASE_URL } from "../../config";
import authAPI from '../api/authAPI';
import axios from "axios";

const useAPI = () => {
    const dispatch = useDispatch();
    
    const { userId } = useSelector(state => state.user);
    const selectedGoal = useSelector(state => state.goals.selectedGoal);
    const [goals, setGoals] = useState([]);
    const [activeTickets, setActiveTickets] = useState([]);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiResponse, setAiResponse] = useState("");

    // Fetch goals
    useEffect(() => {
        authAPI.post("/goals/foruser", {userId})
        // axios.post(`${API_BASE_URL}/goals/foruser`, { userId })
            .then((res) => {
                if (res.forceReload) return window.location.reload()
                setGoals(res.data)
            })
            // .then((res) => setGoals(res.data))
            .catch((err) => console.error(err));
    }, [userId]);

    // Fetch tickets when a goal is selected
    useEffect(() => {
        if (selectedGoal) {
            axios.get(`${API_BASE_URL}/tickets/byGoal/${selectedGoal._id}`)
                .then((res) => setActiveTickets(res.data))
                .catch((err) => console.error(err));
        }
    }, [selectedGoal]);

    const fetchGoalById = async (goalId) => {
        const goal = await authAPI.get(`/goals/byid/${goalId}`)
        return goal;
    }

    // const getGoals = () => dispatch(fetchGoals(userId));

    // Add new goal
    const handleGoalAdded = (newGoal) => setGoals([...goals, newGoal]);
    // Add new ticket
    const handleTicketAdded = (newTicket) => setActiveTickets([...activeTickets, newTicket]);

    // AI-assisted goal breakdown
    const aiSuggestBreakdown = async () => {
        const goal = document.querySelector("#goal-title").value;
        const description = document.querySelector("#goal-description").value;
        try {
            const res = await axios.post(`${API_BASE_URL}/ai/goal_breakdown`, {
                goal, //Providing goal as context, additional context provided server side
                description 
            });
            let ticketArray = JSON.parse(res.data.response);
            setAiSuggestions(ticketArray || []);
        } catch (err) {
            console.error("AI error:", err);
            setAiSuggestions(["⚠️ AI service is unavailable."]);
        }
    };

    const handleAiBreakdownForExistingGoal = async () => {
        if (!selectedGoal) return;
        try {
            const goal = selectedGoal.title;
            const description = selectedGoal.description;
            const existingTickets = activeTickets ? activeTickets.map(ticket => ticket.text).join("; ") : "";
            const res = await axios.post(`${API_BASE_URL}/ai/goal_breakdown`, {
                goal, //Providing goal as context, additional context provided server side
                description,
                existingTickets
            });
            let ticketArray = JSON.parse(res.data.response);
            setAiSuggestions(ticketArray || []);
        } catch (err) {
            console.error("AI error:", err);
        }
    };    

    const handleRemoveSuggestedTicket = (aiSuggestions, toBeDeleted) => {
        setAiSuggestions(aiSuggestions.filter(s => s.text !== toBeDeleted.text));
    }

    // const handleAddNewGoal = async (goal) => {
    //     const newGoal = {
    //         userId: goal.userId,
    //         title: goal.title,
    //         priority: selectedGoal._id,
    //         description: goal.description,
    //         status: "pending",
    //         progress: 50,
    //         parentGoal: "",
    //         subGoals: [],
    //         tickets: []
    //     };
    //     try {
    //         const res = await axios.post(`${API_BASE_URL}/goals/new`)
    //     } catch (e) {

    //     }
    //     setGoals([...goals, newGoal]);
    // }

    // Update ticket status
    const handleTicketDrop = (ticketId, newStatus) => {
        dispatch(updateTicketStatus({ticketId, newStatus}))
    };

    // Delete goals or tickets
    const deleteItem = async (item) => {
        try {
            if (item.type === "ticket") {
                await axios.delete(`${API_BASE_URL}/tickets/delete/${item.id}`);

                // ✅ Dispatch action to update Redux state
                dispatch(removeTicket(item.id));
                dispatch(clearUserActivatedTickets({ clearOne: item.id }))

            } else if (item.type === "goal") {
                const deleteReceipt = await axios.delete(`${API_BASE_URL}/goals/delete/${item.id}`);
                dispatch(removeGoal(item.id));
                for (const deletedTicketID of deleteReceipt.data?.deletedTicketIds) {
                    dispatch(removeTicket(deletedTicketID))
                }
            }
        } catch (err) {
            console.error("Error deleting item:", err);
        }
    };

    // Get AI help for ticket
    const handleHelp = async (ticket) => {
        let goalResponse;
        if (!!ticket.goalId) goalResponse = await fetchGoalById(ticket.goalId);
        const goal = goalResponse?.data || "";
        const request = {
            contextGoals: [goal],
            contextTickets: [ticket],
            userInput: "Please help me achieve this ticket. I need advice.",
            requestType: "advise ticket",
            conversation: JSON.parse(localStorage.ai_conversation),
            userId
        };
        const adviceResponse = await handleAIRequest(request);
        dispatch(logFromExternal({ aiResponse: adviceResponse }));
        dispatch(setIsLoading(false));
    };

    // AI query submission
    const handleAiSubmit = async (query, setUserInput) => {
        if (!query.trim()) return;
        try {
            const res = await axios.post(`${API_BASE_URL}/ai/input`, { query });
            setAiResponse(res.data.response);
            setUserInput("");
        } catch (err) {
            console.error("AI error:", err);
            setAiResponse("⚠️ AI service is currently unavailable.");
        }
    };

    const generateDailyPlan = async (selectedGoal) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/ai/daily_plan`, {
                activeTickets,
                goal: selectedGoal?.title || "General Productivity",
            });
            return res.data.plan; // Expected response: { morning: ["Task1", "Task2"], afternoon: [...], ... }
        } catch (err) {
            console.error("AI error:", err);
            return null;
        }
    };

    const confirmDailyPlan = (plan) => {
        console.log("Confirmed Daily Plan:", plan);
        // Future: Store this plan in DB or update UI state
    };

    return {
        goals,
        activeTickets,
        aiSuggestions,
        aiResponse,
        // getGoals,
        fetchGoalById,
        handleGoalAdded,
        handleTicketAdded,
        aiSuggestBreakdown,
        handleAiBreakdownForExistingGoal,
        handleRemoveSuggestedTicket,
        handleTicketDrop,
        deleteItem,
        handleHelp,
        handleAiSubmit,
        generateDailyPlan,
        confirmDailyPlan,
    };
};

export default useAPI;