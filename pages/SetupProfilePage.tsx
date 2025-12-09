


import React, { useEffect, useState } from 'react';
import { HearingProfile, User } from '../types';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Sliders, Ear, ArrowRight } from 'lucide-react';

interface SetupProfilePageProps {
  user: User;
  onComplete: () => void;
}

const DEFAULT_PROFILE: HearingProfile = {
  eqBands: {
    500: 0,
    1000: 0,
    2000: 0,
    4000: 0,
    8000: 0
  }
};

const EQ_BANDS = [
  { key: 500 as const, label: 'Warmth & Body', desc: 'Low frequencies, fullness' },
  { key: 1000 as const, label: 'Speech Core', desc: 'Vowels, main energy' },
  { key: 2000 as const, label: 'Clarity', desc: 'Consonants clarity' },
  { key: 4000 as const, label: 'Presence', desc: 'Definition, closeness' },
  { key: 8000 as const, label: 'Detail & Air', desc: 'High details, crispness' }
];

export const SetupProfilePage: React.FC<SetupProfilePageProps> = ({ user, onComplete }) => {
  const [profile, setProfile] = useState<HearingProfile>(user.profile || DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the parent re-provides user with a profile, sync it
  useEffect(() => {
    if (user.profile) {
      setProfile(user.profile);
    }
  }, [user.profile]);

  const handleSliderChange = (freq: 500 | 1000 | 2000 | 4000 | 8000, value: number) => {
    setProfile(prev => ({
      ...prev,
      eqBands: {
        ...prev.eqBands,
        [freq]: value
      }
    }));
  };

  const handleUseBalancedProfile = () => {
    // Example balanced preset; adjust values as you like
    setProfile({
      eqBands: {
        500: 0,
        1000: 2,
        2000: 3,
        4000: 3,
        8000: 1
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await authService.updateProfile(user.id, profile);
      onComplete();
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Ear className="w-6 h-6 text-sky-400" />
          <span className="font-semibold text-lg tracking-tight">Earvan</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex justify-center items-center px-4 py-8">
        <div className="max-w-3xl w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl shadow-sky-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Tune your hearing profile
              </h1>
              <p className="text-sm text-slate-400">
                Adjust the sliders while listening to your surroundings. We’ll use this profile in every mode.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-100">Quick start</p>
                <p className="text-xs text-slate-400">
                  Use our balanced enhancement, then fine-tune if needed.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleUseBalancedProfile}
                className="text-xs px-3 py-1.5"
              >
                Use Balanced Profile
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            {EQ_BANDS.map(band => {
              const value = profile.eqBands[band.key];
              return (
                <div
                  key={band.key}
                  className="p-3 md:p-4 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {band.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {band.key} Hz • {band.desc}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-300">
                      {value > 0 ? `+${value} dB` : `${value} dB`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={value}
                    onChange={(e) => handleSliderChange(band.key, Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="flex items-center gap-2"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
