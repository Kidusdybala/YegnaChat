import { VideoIcon } from "lucide-react";

const CallButton = ({ handleVideoCall }) => {
  return (
    <button 
      onClick={handleVideoCall}
      className="absolute top-2 right-4 z-10 bg-primary hover:bg-primary-focus text-white p-2 rounded-full"
      title="Start video call"
    >
      <VideoIcon size={20} />
    </button>
  );
};

export default CallButton;