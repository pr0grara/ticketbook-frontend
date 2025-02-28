import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element }) => {
    const { loggedIn } = useSelector(state => state.session);
    // console.log("LOGGED IN: ", loggedIn)
    return loggedIn ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;