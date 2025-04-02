import { useSelector } from "react-redux";

export function ArcadeEmbed(things) {
    const { dispatch, setWatchedTutorial, watchedTutorial, authAPI, userId } = things;
    const mobileSrc = "https://demo.arcade.software/fdEg1Upu60kNNp4TsxAc?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
    const desktopSrc = "https://demo.arcade.software/R1ByhD1aYRkTQumaTewj?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
    const { isMobile } = useSelector(state => state.session)    

    return (
        <div className="arcade-wrapper">
            {/* <div style={{ position: 'relative', paddingBottom: 'calc(54.02777777777777% + 41px)', height: "100%", width: '100%' }}> */}
            <div>
                <iframe
                    src={isMobile ? mobileSrc : desktopSrc}
                    title="Ticketbook Overview"
                    frameBorder="0"
                    loading="lazy"
                    allowFullScreen
                    allow="clipboard-write"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'light' }}
                />
                <div className="watched-tutorial-button">
                    <span onClick={() => {
                        dispatch(setWatchedTutorial(!watchedTutorial))
                        authAPI.post('/users/mark-tutorial-watched', { userId, watched: !watchedTutorial })
                    }}>
                        ✅ Mark Tutorial as Watched
                    </span>
                </div>
            </div>
        </div>
    )
}

// import { useEffect } from "react";
// import { useSelector } from "react-redux";

// export function ArcadeEmbed() {
//     const userId = useSelector(state => state.userId)
//     useEffect(() => {
//         if (window.arcade) {
//             window.arcade("load", {
//                 id: "R1ByhD1aYRkTQumaTewj", // Your arcade ID
//                 selector: "#arcade-container",
//                 embedMobile: "tab",
//                 embedDesktop: "inline",
//                 showCopyLink: false,
//                 onFinish: () => {
//                     fetch("/api/users/mark-tutorial-watched", {
//                         method: "POST",
//                         credentials: "include",
//                         headers: {
//                             "Content-Type": "application/json",
//                         },
//                         body: { userId }
//                     });
//                 },
//             });
//         }
//     }, []);

//     return (
//         <div id="arcade-container" style={{ width: "100%" }} />
//     );
// }