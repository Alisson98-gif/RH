
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            RH <span className="text-blue-600">AI</span> <span className="text-gray-400 font-normal">| Analyst Pro</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Sistema Operacional
          </span>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="font-medium text-gray-900">Analista Sênior</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
