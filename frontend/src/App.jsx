import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Editor from './pages/Editor';
import PetChat from './components/PetChat';

// 简单的路由守卫
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuth = localStorage.getItem('user_role');
  const user = localStorage.getItem('user_email');

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && isAuth !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/island/:islandCode" element={
            <ProtectedRoute>
              <Reader />
            </ProtectedRoute>
          } />
          <Route path="/editor" element={
            <ProtectedRoute requiredRole="editor">
              <Editor />
            </ProtectedRoute>
          } />
        </Routes>
        <PetChat />
      </div>
    </Router>
  );
}

export default App;
