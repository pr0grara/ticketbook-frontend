import axios from "axios";
import store from "../../redux/store"; // Import Redux store
import { addTicket, setSelectedTickets, updateTicket } from "../../redux/slices/ticketsSlice"; //Import Redux action
import { API_BASE_URL } from "../../config";
import { addGoal, setSelectedGoal } from "../../redux/slices/goalsSlice";
import authAPI from "../api/authAPI";

async function handleAIResponse(res) {
    const createNewTicket = async (res) => {
        if (res.status === "completed") {
            return res.newTicket
        };
        const { title, text, priority, priorityWeight, depends_on, deadline, status, goalId, checklist, notes } = res;
        const { userId, goals } = store.getState();
        const newTicket = {
            title,
            text,
            goalId: goalId ? goalId : goals.selectedGoal ? goals.selectedGoal._id : null,
            userId,
            status: status || "pending",
            priority,
            priorityWeight,
            checklist, 
            notes,
            depends_on,
            deadline
        };
        try {
            const res = await axios.post(`${API_BASE_URL}/tickets/new`, newTicket);
            return res.data;
        } catch (e) {
            return e
        }
    };

    const modifyTicket = async (res) => {
        const { ticketId } = res;
        // const newTicket = ticket;
        // store.dispatch(updateTicketStatus({ticketId, newStatus}))
        try {
            const updatedTicket = await store.dispatch(updateTicket({ ticketId, ticketToUpdate: res })).unwrap(); // ✅ Ensures Promise is resolved
            return updatedTicket;
        } catch (error) {
            return "⚠️ Failed to update ticket status.";
        }
    }

    const createNewGoal = async (aiRes) => {
        const { status } = aiRes;

        if (status && status === "completed") {
            return {newGoal: aiRes.newGoal, newTickets: aiRes.newTickets };
        }
        const { userId } = store.getState();
        const { title, priority, deadline, category, description } = aiRes;
        const newGoal = {
            userId,
            category,
            title,
            priority,
            description,
            deadline
        };
        try {
            const res = await axios.post(`${API_BASE_URL}/goals/new`, newGoal);
            return { newGoal: res.data, newTickets: [] };
        } catch (e) {
            return e
        }
    }

    const { action_type, advice, answer, dev_advice, status } = res;
    if (dev_advice) alert(dev_advice);
    let writeBool = false;
    if (status !== "completed") writeBool = true;

    switch (action_type) {
        case "provide_advice":
            if (res.status === "completed") return res.message.advice;
            return advice;
        case "provide_answer":
            if (res.status === "completed") return res.message.answer;
            return answer
        case "create_ticket":
            const newTicket = await createNewTicket(res)
            store.dispatch(addTicket(newTicket)); //Update Redux state
            return "New ticket added!"
        case "create_many_tickets":
            const newTickets = res.status === "completed" ? res.newTickets : res.tickets;
            for (const newTicket of newTickets) {
                if (res.status === "complete") {
                    store.dispatch(addTicket(newTicket))
                } else {
                    const createdTicket = await createNewTicket(newTicket);
                    store.dispatch(addTicket(createdTicket)); //Update Redux state\
                }
            }
            return "New Tickets added!"
        case "modify_ticket":
            // const modifiedTicket = await modifyTicket(res)
            const modifiedTicket = res.updated_ticket;
            store.dispatch(updateTicket({modifiedTicket})); //Update Redux state
            return "Ticket modified!"
        case "create_goal":
            const newGoalObj = await createNewGoal(res);
            store.dispatch(addGoal(newGoalObj.newGoal));
            for (const newTicket of newGoalObj.newTickets) {
                store.dispatch(addTicket(newTicket.newTicket));
            }
            store.dispatch(setSelectedGoal(newGoalObj.newGoal))
            store.dispatch(setSelectedTickets({newGoal: true, newTickets: newGoalObj.newTickets.map(newTick => newTick.newTicket)}))
            return "New Goal created!"
        case "request_info":
            return res.question
        case "error":
            return res.message
        case "fatal_error":
            return "Fatal AI Error"
        default:
            debugger
            console.error("Unknown action_type in handleAIResponse():", res);
            return `Unkown action_type: "${action_type}", in handleAIResponse()`
    }
}

// 🏗️ FOUNDATION LAYER: Calls GPT-4o with basic reasoning power
async function callAI(request) {
    const { userId } = store.getState()
    try {
        const {userInput, context, requestType, conversation, aiHistory} = request;
        var response;
        switch (requestType) {
            case "advise ticket":
                response = await authAPI.post(
                    '/ai/advise-ticket',
                    {userInput, context}
                )
                break
            default:
                response = await axios.post(
                    `${API_BASE_URL}/ai/request`,
                    { userInput, context, requestType, conversation, aiHistory, userId },
                    { headers: { "Content-Type": "application/json" } }
                );
                break
        }
        return response.data.response;
    } catch (error) {
        console.error("AI API Error:", error);
        return "⚠️ AI service is currently unavailable.";
    }
}

// 🎯 CONTEXT LAYER: Injects Goal & Ticket Data Before AI Call
function prepareContext(contextGoals, contextTickets) {
    // if (!selectedGoal) return "No goal selected.";
    return {
        goals: contextGoals.map(goal => ({
            goal: goal.title,
            description: goal.description,
            goalId: goal._id
        })),
        allTickets: contextTickets.map(ticket => ({
            task: ticket.text,
            priority: ticket.priority,
            ticketId: ticket._id,
            notes: ticket.notes,
            checklist: ticket.checklist,
            status: ticket.status
        }))
    };
}

// 🏗️ POST-PROCESSING LAYER: Cleans & Validates AI Output
function refineAIOutput(rawOutput) {
    if (typeof rawOutput === "object") return rawOutput;
    try {
        return JSON.parse(rawOutput); // ✅ Ensure valid JSON output
    } catch (error) {
        console.error("AI Response Error:", error);
        return { error: "Invalid AI response format." };
    }
}

// 🚀 MAIN FUNCTION: Calls AI with Context & Instructions
async function handleAIRequest(request) {
    const { requestType, contextGoals, contextTickets, userInput, from, aiHistory, userId } = request;
    const context = prepareContext(contextGoals, contextTickets);
    const aiResponse = await callAI({userInput, context, requestType, from, aiHistory, userId});
    return refineAIOutput(aiResponse);
}

export { handleAIRequest, handleAIResponse };