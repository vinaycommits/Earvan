import React from 'react';
import { Button } from '../components/Button';
import { Ear, Play, Sparkles } from 'lucide-react';

interface SplashPageProps {
  onGetStarted: () => void;
  userName?: string;
}

export const SplashPage: React.FC<SplashPageProps> = ({ onGetStarted, userName }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500 rounded-full blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary-500 rounded-full blur-[128px] opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <Ear className="w-12 h-12 text-primary-400" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
          </div>
        </div>

        <h2 className="text-lg font-medium text-primary-400 mb-2">
          Hello, {userName || 'Friend'}
        </h2>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Earvan</span>
        </h1>

        <p className="text-xl text-slate-300 font-light leading-relaxed mb-12">
          Turn your earphones into a <br/>
          <span className="font-semibold text-white">smart hearing enhancer.</span>
        </p>

        <Button 
          onClick={onGetStarted} 
          variant="primary" 
          className="w-64 py-4 text-lg bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 border-none ring-offset-2 ring-offset-slate-900 focus:ring-2 focus:ring-primary-500"
        >
          Get Started
          <Play className="w-5 h-5 ml-2 fill-current" />
        </Button>
      </div>

      <div className="absolute bottom-6 text-slate-500 text-sm">
        v1.0.0 Alpha
      </div>
    </div>
  );
};