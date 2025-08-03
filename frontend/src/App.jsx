import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import CallPage from "./Pages/CallPage";
import NotnificationsPage from "./Pages/NotnificationsPage";
import OnBoardingPage from "./Pages/OnBoardingPage";
import ChatPage from "./Pages/ChatPage";
import { Toaster, toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query"; // Add this import
import { axiosInstance } from "./lib/axios"; // Fix this import

const App = () => {
  const {data, isLoading, isError} = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error) {
        console.error("Auth error:", error);
        return { user: null };
      }
    },
  });
  
  const authUser = data?.user;
  
  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) return <div className="error">Error loading user data</div>;
  
  return (
    <div className="h-screen" data-theme="night">
      <button onClick={()=> toast.success("Hello world!")}> Toast </button>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/call" element={authUser ? <CallPage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={authUser ? <NotnificationsPage /> : <Navigate to="/login" />} />
        <Route path="/onboarding" element={authUser ? <OnBoardingPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster/>
    </div>
  );
};

export default App;
