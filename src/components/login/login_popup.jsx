import React, { useState } from 'react';

const LoginPopup = () => {
    // Declare a new state variable, which we'll call "count"
    const [user, setUser] = useState(0);

    return (
        <div>
            <p>You clickedd {user} times</p>
            <div className="login">
                <div className="login-user">username</div>
                <div className="login-pass">password</div>
                <div className="login-submit">submit</div>
            </div>
            <button onClick={() => setUser(user + 1)}>
                Click me
            </button>
        </div>
    );
};

export default LoginPopup;