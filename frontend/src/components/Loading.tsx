import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-primary text-dark-text flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Connecting Wallet...</h2>
        <p className="text-gray-400">Please wait while we connect to your wallet</p>
      </div>
    </div>
  );
};

export default Loading;
