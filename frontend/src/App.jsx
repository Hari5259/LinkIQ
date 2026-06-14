import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Placeholder — will be replaced with protected dashboard routes */}
          <Route path="/dashboard" element={
            <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold gradient-text mb-4">Dashboard</h1>
                <p className="text-gray-400">Coming in Commit 20</p>
              </div>
            </div>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      {/* Toast notifications — positioned top-right, dark themed */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1c2e',
            color: '#e5e7eb',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#0a0a0f' },
          },
          error: {
            iconTheme: { primary: '#fb7185', secondary: '#0a0a0f' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
