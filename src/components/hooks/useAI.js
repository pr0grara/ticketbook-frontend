import axios from "axios";
import store from "../../redux/store"; // Import Redux store
import { addTicket, updateTicket } from "../../redux/slices/ticketsSlice"; //Import Redux action
import { API_BASE_URL } from "../../config";

async function parseAIResponse(res) {
    const createNewTicket = async (res) => {
        const { text, priority, priorityWeight, depends_on, deadline, status } = res;
        const { user_id, goals } = store.getState();
        // debugger
        const newTicket = {
            text,
            goalId: goals.selectedGoal ? goals.selectedGoal._id : null,
            userId: user_id,
            status: status || "pending",
            priority,
            priorityWeight,
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

    const { action_type, advice, answer, dev_advice } = res;
    if (dev_advice) alert(dev_advice);
    
    switch (action_type) {
        case "provide_advice":
            return advice;
        case "provide_answer":
            return answer
        case "create_ticket":
            const newTicket = await createNewTicket(res)
            store.dispatch(addTicket(newTicket)); //Update Redux state
            return "New ticket added!"
        case "modify_ticket":
            const modifiedTicket = await modifyTicket(res)
            store.dispatch(addTicket(modifiedTicket)); //Update Redux state
            return "Ticket modified!"
        default:
            return "unkown action_type in parseAIResponse()"
    }
}

// 🏗️ FOUNDATION LAYER: Calls GPT-4o with basic reasoning power
async function callAI(request) {
    try {
        const {userInput, context, requestType, conversation, aiHistory} = request;
        const response = await axios.post(
            // API_URL,
            `${API_BASE_URL}/ai/request`,
            { userInput, context, requestType, conversation, aiHistory },
            { headers: { "Content-Type": "application/json" } }
        );
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
            id: goal._id
        })),
        allTickets: contextTickets.map(ticket => ({
            task: ticket.text,
            priority: ticket.priority,
            id: ticket._id,
            status: ticket.status
        }))
    };
}

// 🏗️ POST-PROCESSING LAYER: Cleans & Validates AI Output
function refineAIOutput(rawOutput) {
    try {
        return JSON.parse(rawOutput); // ✅ Ensure valid JSON output
    } catch (error) {
        console.error("AI Response Error:", error);
        return { error: "Invalid AI response format." };
    }
}

// 🚀 MAIN FUNCTION: Calls AI with Context & Instructions
async function handleAIRequest(request) {
    const { requestType, contextGoals, contextTickets, userInput, conversation, from, aiHistory } = request;
    const context = prepareContext(contextGoals, contextTickets);
    const aiResponse = await callAI({userInput, context, requestType, conversation, from, aiHistory});
    return refineAIOutput(aiResponse);
}

export { handleAIRequest, parseAIResponse };