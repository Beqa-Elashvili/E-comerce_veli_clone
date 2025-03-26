"use client";

import React from "react";
import { ClipLoader } from "react-spinners";

const LoadingModal = () => {
  return (
    <div className="relative z-50">
      <div>
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 transition-opacity" />
      </div>
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div>
            <ClipLoader size={40} color="#0284c7" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
