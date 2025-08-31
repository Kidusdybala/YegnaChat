import Sidebar from './Sidebar'; // Fixed casing
import Navbar from './Navbar'; // Fixed casing
import MobileBottomNav from './MobileBottomNav';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, showSidebar = false}) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  const isChatConversation = location.pathname.startsWith('/chat/');
  
  return (
    <div className='min-h-screen bg-base-100 prevent-horizontal-scroll'>
        <div className='flex h-screen'>
            {showSidebar && <Sidebar />}
            <div className='flex-1 flex flex-col min-w-0'>
                <Navbar />
                <main className={`flex-1 p-0 safe-area-inset-bottom ${
                  isChatPage ? 'overflow-hidden' : 'overflow-y-auto'
                } ${isChatConversation ? '' : 'pb-16 lg:pb-0'}`}>
                  <div className={`prevent-horizontal-scroll ${isChatPage ? 'h-full' : ''}`}>
                    {children}
                  </div>
                </main>
            </div>
        </div>
        <MobileBottomNav />
    </div>
  );
};

export default Layout;