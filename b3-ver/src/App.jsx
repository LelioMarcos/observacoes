import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Layout from './pages/Layout';
import Stock from './pages/Stock';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/symbol/:symbol" element={<Stock />} />
      </Route>
    </Routes>
  )
}

export default App;
