import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

export const Callpage = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Call Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Caller Info */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="avatar mb-4 sm:mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-primary">
              <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl sm:text-3xl lg:text-4xl font-bold">
                JD
              </div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content mb-2">John Doe</h2>
          <p className="text-sm sm:text-base text-base-content opacity-70">Calling...</p>
        </div>

        {/* Call Duration */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-base-200 px-4 py-2 rounded-full">
            <span className="text-sm sm:text-base font-mono">00:00</span>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-base-200 p-4 sm:p-6 safe-area-inset-bottom">
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8 max-w-md mx-auto">
          {/* Mute Button */}
          <button className="btn btn-circle btn-lg bg-base-300 hover:bg-base-content hover:text-base-100 touch-target">
            <Mic className="w-6 h-6" />
          </button>

          {/* Video Button */}
          <button className="btn btn-circle btn-lg bg-base-300 hover:bg-base-content hover:text-base-100 touch-target">
            <Video className="w-6 h-6" />
          </button>

          {/* End Call Button */}
          <button className="btn btn-circle btn-lg bg-error hover:bg-error-focus text-error-content touch-target">
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker Button */}
          <button className="btn btn-circle btn-lg bg-base-300 hover:bg-base-content hover:text-base-100 touch-target">
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Callpage;