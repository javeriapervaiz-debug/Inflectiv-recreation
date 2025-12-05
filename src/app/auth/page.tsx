'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database, Wallet, Mail, ArrowLeft, Loader2, Chrome, Sparkles, Heart, Star } from 'lucide-react';
import { useWeb3Auth } from '@/lib/web3auth';

function useClientTime() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

export default function AuthPage() {
  const router = useRouter();
  const { connect, isConnected, isLoading, isInitialized, error } = useWeb3Auth();
  const currentTime = useClientTime();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  const handleConnect = async () => {
    setLocalError(null);
    try {
      await connect();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Pastel Sunset Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ffecd2] via-[#fcb69f] via-[60%] to-[#ee9ca7]" />

      {/* Soft Grid Overlay */}
      <div
        className="fixed inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative floating elements */}
      <div className="fixed top-20 left-16 w-24 h-24 rounded-full bg-gradient-to-br from-[#ffb5c5]/40 to-[#dbb4f3]/40 blur-xl animate-float" />
      <div className="fixed top-40 right-24 w-16 h-16 rounded-full bg-gradient-to-br from-[#a0e7e5]/40 to-[#b5ead7]/40 blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="fixed bottom-48 left-24 w-20 h-20 rounded-full bg-gradient-to-br from-[#ffeaa7]/40 to-[#ffd1b3]/40 blur-xl animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="fixed bottom-32 right-40 w-32 h-32 rounded-full bg-gradient-to-br from-[#a8d8ea]/40 to-[#dbb4f3]/40 blur-xl animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Small cute floating icons */}
      <div className="fixed top-1/4 left-1/4 text-[#ffeaa7] opacity-70 animate-float" style={{ animationDelay: '0.8s' }}>
        <Star className="w-5 h-5 fill-current" />
      </div>
      <div className="fixed top-1/3 right-1/5 text-[#ffb5c5] opacity-60 animate-float" style={{ animationDelay: '1.2s' }}>
        <Heart className="w-4 h-4 fill-current" />
      </div>
      <div className="fixed bottom-1/4 right-1/4 text-[#dbb4f3] opacity-50 animate-float" style={{ animationDelay: '1.6s' }}>
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Main Window */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Window Frame */}
        <div className="bg-[#f5f0f7] rounded-xl shadow-[0_8px_32px_rgba(139,123,168,0.3),inset_-1px_-1px_#b8a8c5,inset_1px_1px_#ffffff] overflow-hidden">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#b4a7d6] to-[#d5a6bd] px-4 py-3 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-white drop-shadow-sm" />
              <span className="text-white text-sm font-bold drop-shadow-sm">Login - INFLECTIV</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ffeaa7] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#b5ead7] shadow-sm" />
              <Link href="/" className="w-3 h-3 rounded-full bg-[#ffb7b2] shadow-sm hover:bg-[#ff8fab] transition-colors" />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 bg-gradient-to-br from-[#fff9fb] via-[#fef3f0] to-[#f5f0f7]">
            {/* Logo & Title */}
            <div className="text-center mb-6">
              <h1
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#b4a7d6] via-[#d5a6bd] to-[#ffb5c5] bg-clip-text text-transparent"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                INFLECTIV
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#fdcb6e]" />
                <p className="text-[#8b7ba8]" style={{ fontFamily: 'VT323, monospace' }}>
                  ACCESS THE DATA LAYER
                </p>
                <Sparkles className="w-4 h-4 text-[#fdcb6e]" />
              </div>
            </div>

            {/* Login Options */}
            <div className="space-y-3">
              {/* Google Login */}
              <button
                onClick={handleConnect}
                disabled={isLoading || !isInitialized}
                className="w-full bg-white rounded-xl px-4 py-3 text-[#3d3d3d] font-semibold shadow-[0_2px_8px_rgba(139,123,168,0.15)] hover:shadow-[0_4px_16px_rgba(139,123,168,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#8b7ba8]" />
                ) : (
                  <Chrome className="w-5 h-5 text-[#4285F4]" />
                )}
                <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              {/* Wallet Connect */}
              <button
                onClick={handleConnect}
                disabled={isLoading || !isInitialized}
                className="w-full bg-gradient-to-r from-[#b4a7d6] to-[#d5a6bd] rounded-xl px-4 py-3 text-white font-semibold shadow-[0_2px_8px_rgba(180,167,214,0.3)] hover:shadow-[0_4px_16px_rgba(180,167,214,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#e8e0ed]" />
                <span className="text-sm text-[#8b7b9b]">OR</span>
                <div className="flex-1 h-px bg-[#e8e0ed]" />
              </div>

              {/* Email Login */}
              <button
                onClick={handleConnect}
                disabled={isLoading || !isInitialized}
                className="w-full bg-white rounded-xl px-4 py-3 text-[#3d3d3d] font-semibold shadow-[0_2px_8px_rgba(139,123,168,0.15)] hover:shadow-[0_4px_16px_rgba(139,123,168,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#8b7ba8]" />
                ) : (
                  <Mail className="w-5 h-5 text-[#8b7ba8]" />
                )}
                <span>{isLoading ? 'Connecting...' : 'Continue with Email'}</span>
              </button>
            </div>

            {/* Error Display */}
            {(error || localError) && (
              <div className="mt-4 p-3 bg-[#ffb7b2]/20 rounded-lg text-[#ff6b6b] text-sm text-center border border-[#ffb7b2]/30">
                {error || localError}
              </div>
            )}

            {/* Not initialized warning */}
            {!isInitialized && (
              <div className="mt-4 p-3 bg-[#e8e0ed]/50 rounded-lg text-[#8b7b9b] text-sm text-center flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Initializing...
              </div>
            )}

            {/* Terms */}
            <p className="text-center text-xs text-[#b8a8c5] mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Status Bar */}
          <div className="bg-[#f5f0f7] px-3 py-2 text-xs flex justify-between border-t border-[#e8e0ed]">
            <span className="px-2 py-1 text-[#8b7b9b] bg-[#e8e0ed]/50 rounded">
              {isInitialized ? 'Ready' : 'Loading...'}
            </span>
            <Link
              href="/"
              className="px-2 py-1 text-[#8b7ba8] bg-[#e8e0ed]/50 rounded flex items-center gap-1 hover:bg-[#b4a7d6] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-[#f5f0f7] to-[#e8e0ed] border-t-2 border-white/50 shadow-[0_-4px_16px_rgba(139,123,168,0.15)] px-2 flex items-center gap-3 z-40">
        <button className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-b from-[#b5ead7] to-[#a8e6cf] rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-semibold text-[#3d3d3d]">
          <Sparkles className="w-4 h-4" />
          Start
        </button>
        <div className="h-6 w-px bg-[#d5c8de]" />
        <div className="flex-1 flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e8e0ed]/70 rounded-lg text-sm text-[#5a5a5a]">
            <Database className="w-4 h-4 text-[#8b7ba8]" />
            Login
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e8e0ed]/70 rounded-lg text-sm text-[#5a5a5a]">
          <div className="w-2 h-2 rounded-full bg-[#b5ead7] animate-pulse" />
          <span>{currentTime || '--:--'}</span>
        </div>
      </div>
    </div>
  );
}
