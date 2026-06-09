import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import UserManagement from './pages/user-management/UserManagement';
import DocumentList from './pages/documents/DocumentList';
import UploadDocument from './pages/documents/UploadDocument';
import SignDocument from './pages/documents/SignDocument';
import PrepareDocument from './pages/documents/PrepareDocument';
import AuditLogs from './pages/audit-logs/AuditLogs';
import Settings from './pages/settings/Settings';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import SetupAccount from './features/auth/SetupAccount';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Toaster richColors position="bottom-right" />
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/setup-account/:token" element={<SetupAccount />} />

          {/* Protected Routes using MainLayout for stable UI */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/documents" element={<DocumentList />} />
              <Route path="/upload" element={<UploadDocument />} />
              <Route path="/sign/:id" element={<SignDocument />} />
              <Route path="/prepare/:id" element={<PrepareDocument />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/activity" element={<AuditLogs />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
