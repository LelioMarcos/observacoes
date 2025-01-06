import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';

function ProtectedRoute({children}){
    const {token, tryLogin} = useAuth();

    if (token) return children;

    return <Navigate to="/login" />
    
}

export default ProtectedRoute;