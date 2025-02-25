import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";

export default function Ticket() {
    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!loading) return;
        axios.post(`${API_BASE_URL}/tickets/foruser`, {
            id: 1
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                setTickets(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    })

    if (loading) return <p>Loading tickets...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div id="tickets-page">
            <div id="tickets-container">
                {tickets.map((ticket, index) => {
                    let createdOn = new Date(ticket.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                    let deadline = new Date(ticket.deadline).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });

                    return(
                        <id key={index} className="ticket-container">
                            <div className="ticket-title ticket-item">{ticket.title}</div>
                            <div className="ticket-body ticket-item">{ticket.body}</div>
                            <div className="ticket-time ticket-item">
                                <div className="ticket-created-container ticket-item">
                                    <div className="ticket-deadline-title">Created On</div>
                                    <div className="ticket-deadline">{createdOn}</div>
                                </div>
                                <div className="ticket-deadline-container ticket-item">
                                    <div className="ticket-deadline-title">Due By</div>
                                    <div className="ticket-deadline">{deadline}</div>
                                </div>
                            </div>
                        </id>
                    )
                })}
                {/* <div>{JSON.stringify(tickets, null, 2)}</div> */}
            </div>
        </div>
    )
}