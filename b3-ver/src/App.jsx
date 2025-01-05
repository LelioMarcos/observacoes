import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Layout from './pages/Layout';
import axios from "axios";
import AuthProvider from './providers/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

axios.defaults.baseURL = "http://127.0.0.1:8000";

function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
    </AuthProvider>
  )
}

export default App;
