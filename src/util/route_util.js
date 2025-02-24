import React from 'react';
import { connect } from 'react-redux';
import { Route, Navigate, withRouter } from 'react-router-dom';

// Passed in from parent component or from mapStateToProps
const Auth = ({ component: Component, path, loggedIn, exact }) => (
    <Route path={path} exact={exact} render={(props) => (
        !loggedIn ? (
            <Component {...props} />
        ) : (
            // Navigate to the trips page if the user is authenticated
            <Navigate to="/" />
        )
    )} />
);

const Protected = ({ component: Component, loggedIn, ...rest }) => (
    <Route
        // {...rest} what is this?
        render={props =>
            loggedIn ? (
                <Component {...props} />
            ) : (
                // Navigate to the login page if the user is already authenticated
                <Navigate to="/login" />
            )
        }
    />
);

// Use the isAuthenitcated slice of state to determine whether a user is logged in

const mapStateToProps = state => (
    { loggedIn: state.session.isAuthenticated }
);

export const AuthRoute = withRouter(connect(mapStateToProps)(Auth));
export const ProtectedRoute = withRouter(connect(mapStateToProps)(Protected));