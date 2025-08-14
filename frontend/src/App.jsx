import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import CallPage from "./Pages/CallPage";
import NotificationsPage from "./Pages/NotificationsPage";
import EditProfile from "./Pages/EditProfile";
import ChatPage from "./Pages/ChatPage";
import FriendsPage from "./Pages/FriendsPage";
import ChangePassword from "./Pages/ChangePassword";
import EmailVerification from "./Pages/EmailVerification";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import SettingsPage from "./Pages/SettingsPage";
import ThemeProvider from "./context/ThemeContext";

const App = () => {
  const { authUser, isLoading, isError } = useAuthUser();

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="error">Error loading user data</div>;

  return (
    <ThemeProvider>
      <div className="h-screen">
        <Routes>
        <Route 
          path="/" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/verify-email" element={!authUser ? <EmailVerification /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!authUser ? <ResetPassword /> : <Navigate to="/" />} />

        <Route 
          path="/call" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <CallPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route 
          path="/friends" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route 
          path="/notifications" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <NotificationsPage /> {/*  Correct usage */}
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route 
          path="/editprofile" 
          element={authUser ? <EditProfile /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/change-password" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <ChangePassword />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/chat" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route 
          path="/chat/:chatId" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route 
          path="/settings" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <SettingsPage/>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        </Routes>

        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default App;
