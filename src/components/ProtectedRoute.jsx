import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ component }) => {
    const { loggedIn } = useSelector(state => state.session);
    // console.log("LOGGED IN: ", loggedIn)
    return loggedIn ? component : <Navigate to="/login" replace />;
};

export default ProtectedRoute;