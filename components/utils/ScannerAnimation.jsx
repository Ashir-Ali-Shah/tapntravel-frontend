import React from "react";
import { RiRfidLine } from "react-icons/ri";

const ScannerAnimation = ({ message = "Please scan your card" }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h1 className="text-lg font-bold">{message}</h1>
      <div className="p-6 rounded-full bg-gray-200 relative animate-scan-wrapper">
        <div className="p-4 rounded-full bg-white">
          <RiRfidLine size={50} className="text-primary" />
        </div>
      </div>
      <p className="text-gray-500 mt-4">Waiting for card input...</p>

      <style jsx>{`
        @keyframes scanEffect {
          0% {
            box-shadow: 0 0 0px rgba(0, 128, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 128, 255, 0.8);
          }
          100% {
            box-shadow: 0 0 0px rgba(0, 128, 255, 0.2);
          }
        }

        .animate-scan-wrapper {
          animation: scanEffect 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ScannerAnimation;
