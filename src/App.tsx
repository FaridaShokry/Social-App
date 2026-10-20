import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PostDetails from "./pages/PostDetails";

function Protected({ children }: { children: ReactNode }) {
  return localStorage.getItem("token") ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Protected><Feed /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
      <Route path="/posts/:id" element={<Protected><PostDetails /></Protected>} />
    </Routes>
  );
}