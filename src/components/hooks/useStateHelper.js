import { useState, useEffect } from "react";
import axios from "axios";

const prepareTicketsForAI = (tickets) => {
    // let filterTickets = (tickets) => {
    //     let [highs, mids, lows] = [];

    //     tickets.forEach(t => {
    //         switch (t.priority) {
    //             case ("HIGH"):
    //                 highs.push(t.text, t.status)
    //             case ("MIDS"):
    //                 mids.push(t.text, t.status)
    //             case ("MIDS"):
    //                 lows.push(t.text, t.status)
    //         }
    //     })
        
    // };
    let preppedTickets = {};
    let highs = tickets.filter(t => t.priority === "HIGH");
    let mids = tickets.filter(t => t.priority === "MED");
    let lows = tickets.filter(t => t.priority === "LOW");

    preppedTickets = { "HighPriority": highs, "MediumPriority": mids, "LowPriority": lows }
    return preppedTickets;
};

const prepareGoalForAI = (tickets) => {
    let { title, description, category, priority } = tickets;
    let preppedGoal = {};
    preppedGoal = { title, description, category, priority }
    return preppedGoal;
};

const prepareContextForAI = (context, conversation) => {
    let preppedContext = {};
    preppedContext["tickets"] = prepareTicketsForAI(context["tickets"])
    preppedContext["goal"] = prepareGoalForAI(context["goal"])
    preppedContext["chatHistory"] =  conversation;
    debugger
    return JSON.stringify(preppedContext);
}

export { prepareContextForAI };