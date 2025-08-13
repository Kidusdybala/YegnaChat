import {LoaderIcon} from "lucide-react";
function ChatLoader() { 
    return (
        <div className="h-screen flex flex-col items-center justify-center p-4">

            <LoaderIcon className="animate-spin size-10 text-primary" />
            <p className="text-center mt-4 text-lg font-mono">Connecting to Chat...</p>
        </div>
    );
}
export default ChatLoader;