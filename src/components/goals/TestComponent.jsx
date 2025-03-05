//Purely a shell testing component workspace

//NOT TO BE INCLUDED IN PRODUCTION

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { Trash2 } from "lucide-react";
import useAPI from "../hooks/useAPI.js";
import AICanvas from "../ai/AICanvas.jsx";
import { setSelectedGoal } from "../../redux/slices/goalsSlice";
import { fetchTickets, setSelectedTickets } from "../../redux/slices/ticketsSlice.js";

console.log("TEST COMPONENT HAS BEEN INCLUDED.\nCHECK TestComponent.jsx")

function Goals() {
}

export default Goals;
