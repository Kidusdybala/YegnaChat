import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import CallPage from "./Pages/CallPage";
import NotificationsPage from "./Pages/NotificationsPage";
import OnBoardingPage from "./Pages/OnBoardingPage";
import ChatPage from "./Pages/ChatPage";
import FriendsPage from "./Pages/FriendsPage";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import ThemeSelector from "./components/ThemeSelector";

const App = () => {
  const { authUser, isLoading, isError } = useAuthUser();

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="error">Error loading user data</div>;

  return (
    <div className="h-screen" data-theme="night">
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
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />

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
                <NotificationsPage /> {/* ✅ Correct usage */}
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route 
          path="/onboarding" 
          element={authUser ? <OnBoardingPage /> : <Navigate to="/login" />} 
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
          path="/settings" 
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-6">Settings</h1>
                  <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title mb-4">Theme Settings</h2>
                      <ThemeSelector />
                    </div>
                  </div>
                </div>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
