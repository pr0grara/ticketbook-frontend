import React, { useEffect } from 'react';
import { setSelectedGoal } from '../../redux/slices/goalsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setPopup } from '../../redux/slices/canvasSlice';
import { X } from 'lucide-react';

const CanvasPopup = ({type, goalObjs}) => {
    const dispatch = useDispatch();

    const { isMobile } = useSelector(state => state.session);

    useEffect(() => {
        const handler = () => !isMobile && positionPopupAndConnector();
        const timer = setTimeout(handler, 30);
        window.addEventListener('resize', handler);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handler);
        };
    }, []);

    function positionPopupAndConnector() {
        const input = document.querySelector('.canvas-input');
        const popup = document.querySelector('.canvas-popup');
        const path = document.querySelector('.canvas-connector-path');

        if (!popup || !input || !path) return;

        const inputRect = input.getBoundingClientRect();

        // Position the popup above input
        popup.style.bottom = `${isMobile ? '200' : '250'}px`; // keep this
        const popupX = inputRect.left + inputRect.width / 2;
        popup.style.left = `${popupX}px`;
        popup.style.transform = `translateX(${isMobile ? '-50%' : '-40%'})`;

        // RE-READ RECT **after** applying position
        
            const popupRect = popup.getBoundingClientRect();
    
            // Draw curve: popup center -> input center
            const x1 = popupRect.left + popupRect.width / 2;
            const y1 = popupRect.top + popupRect.height / 2;
            const x2 = inputRect.left + 70;
            const y2 = inputRect.top;
    
            const curve = Math.min(Math.abs(y2 - y1) / 2, 80);
            const d = `M ${x1},${y1}
                 C ${x1},${y1 + curve}
                   ${x2},${y2 - curve}
                   ${x2},${y2}`;
    
            path.setAttribute('d', d);
    }

    switch (type) {
        case "SPECIFY_GOAL_FOR_TICKET":
            let goals = goalObjs.goals.map(g => ({
                _id: g._id,
                title: g.title
            }))
            return (
                <div className="canvas-popup">
                    <div className="canvas-popup-header">Add to a specific goal?</div>
                    {/* <div className="canvas-connector-line" /> */}
                    <div className="canvas-goal-selectors-container">
                        <button
                            title="clear chat history"
                            className="clear-chat-top"
                            onClick={() => {
                                dispatch(setPopup(false))
                                if (!isMobile) document.querySelector('.canvas-connector-svg').style.display = 'none'
                            }}
                            aria-label="Clear conversation"
                        >
                            <X size={14} />
                        </button>
                        {goals.map((goal, idx) => {
                            return (
                                <div className="canvas-goal-selector" 
                                data-id={goal._id}
                                key={idx}
                                onClick={() => {
                                    dispatch(setSelectedGoal(goal))
                                    dispatch(setPopup(false))
                                    if (!isMobile) document.querySelector('.canvas-connector-svg').style.display = 'none'
                                    document.querySelector('.canvas-input').focus();
                                }
                                }
                                >
                                    {goal.title}
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        default:
            return (
                <div className="canvas-popup">
                    <h2>Canvas Popup</h2>
                    <p>{type}</p>
                </div>
            );
    }
};

export default CanvasPopup;