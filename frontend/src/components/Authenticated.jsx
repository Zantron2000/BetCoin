import { useSSX } from "@spruceid/ssx-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Authenticated({ children }) {
    const { ssx } = useSSX();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (!ssx?.session()) {
            navigate('/')
        } else {
            setIsAuthenticated(true)
        }
    })

    return isAuthenticated ? children : null
}

export default Authenticated
