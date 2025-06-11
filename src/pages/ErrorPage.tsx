import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  error: Error;
}

const ErrorPage: React.FC<Props> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-primary text-dark-text">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error.message}</p>
          <div className="flex gap-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
