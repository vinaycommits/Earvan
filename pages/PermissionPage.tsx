import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Mic, Headphones, Check, AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface PermissionPageProps {
  onComplete: () => void;
}

export const PermissionPage: React.FC<PermissionPageProps> = ({ onComplete }) => {
  const [micStatus, setMicStatus] = useState<'IDLE' | 'REQUESTING' | 'GRANTED' | 'DENIED'>('IDLE');
  const [headphoneStatus, setHeadphoneStatus] = useState<'IDLE' | 'CHECKING' | 'DETECTED' | 'NOT_DETECTED'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestMicAccess = async () => {
    setMicStatus('REQUESTING');
    setErrorMsg(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('GRANTED');
    } catch (err) {
      console.error(err);
      setMicStatus('DENIED');
      setErrorMsg('Microphone access was denied. Please enable it in browser settings.');
    }
  };

  const checkHeadphones = () => {
    setHeadphoneStatus('CHECKING');
    // In a browser environment, we can't strictly force headphone connection detection reliably across all OS/Browsers without playing audio or complex logic.
    // However, we can prompt the user to confirm they are wearing them.
    // For this prototype, we will simulate a check or simply ask for user confirmation.
    
    setTimeout(() => {
        // We assume user connected them for the flow
        setHeadphoneStatus('DETECTED');
    }, 1500);
  };

  const allGranted = micStatus === 'GRANTED' && headphoneStatus === 'DETECTED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Setup Your Experience</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            To provide the best hearing enhancement, Earvan needs access to your microphone and requires headphones.
          </p>
        </div>

        <div className="w-full space-y-6">
          
          {/* Microphone Card */}
          <div className={`
            p-6 rounded-2xl border transition-all duration-300
            ${micStatus === 'GRANTED' 
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}
          `}>
            <div className="flex items-start gap-4">
              <div className={`
                p-3 rounded-xl 
                ${micStatus === 'GRANTED' 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}
              `}>
                <Mic className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Microphone Access</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Needed to capture ambient sound and process it for enhancement.</p>
                
                {micStatus !== 'GRANTED' && (
                   <Button 
                     onClick={requestMicAccess} 
                     disabled={micStatus === 'REQUESTING'}
                     className={micStatus === 'DENIED' ? 'bg-red-500 hover:bg-red-600' : ''}
                   >
                     {micStatus === 'REQUESTING' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                     {micStatus === 'DENIED' ? 'Access Denied (Retry)' : 'Allow Microphone Access'}
                   </Button>
                )}
                
                {micStatus === 'GRANTED' && (
                  <div className="flex items-center text-green-700 dark:text-green-400 font-medium">
                    <Check className="w-5 h-5 mr-2" />
                    Access Granted
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Headphones Card */}
          <div className={`
            p-6 rounded-2xl border transition-all duration-300
            ${headphoneStatus === 'DETECTED' 
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}
          `}>
            <div className="flex items-start gap-4">
              <div className={`
                p-3 rounded-xl 
                ${headphoneStatus === 'DETECTED' 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400'}
              `}>
                <Headphones className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Connect Earphones</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Wired or Bluetooth earphones are required to prevent audio feedback.</p>
                
                {headphoneStatus !== 'DETECTED' && (
                   <Button 
                     onClick={checkHeadphones} 
                     variant="secondary"
                     disabled={headphoneStatus === 'CHECKING'}
                   >
                     {headphoneStatus === 'CHECKING' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                     {headphoneStatus === 'CHECKING' ? 'Connecting...' : 'I Have Connected Earphones'}
                   </Button>
                )}

                {headphoneStatus === 'DETECTED' && (
                  <div className="flex items-center text-green-700 dark:text-green-400 font-medium">
                    <Check className="w-5 h-5 mr-2" />
                    Earphones Ready
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {errorMsg && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

      </div>

      <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 transition-colors duration-300">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <p className="text-sm text-slate-400">Step 2 of 2</p>
          <Button 
            onClick={onComplete} 
            disabled={!allGranted}
            className={`transition-all duration-500 ${!allGranted ? 'opacity-50 grayscale' : 'opacity-100'}`}
          >
            Enter Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};