'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Upload, Coins, ArrowRight, Folder, Cpu, Zap, Sparkles, Star, Heart, Cloud } from 'lucide-react';

export default function LandingPage() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
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
      <div className="fixed top-1/4 left-1/3 text-[#ffeaa7] opacity-70 animate-float" style={{ animationDelay: '0.8s' }}>
        <Star className="w-5 h-5 fill-current" />
      </div>
      <div className="fixed top-1/3 right-1/4 text-[#a0e7e5] opacity-60 animate-float" style={{ animationDelay: '1.2s' }}>
        <Heart className="w-4 h-4 fill-current" />
      </div>
      <div className="fixed bottom-1/3 left-1/4 text-[#ffb5c5] opacity-60 animate-float" style={{ animationDelay: '2s' }}>
        <Cloud className="w-6 h-6 fill-current" />
      </div>
      <div className="fixed top-1/2 right-1/3 text-[#dbb4f3] opacity-50 animate-float" style={{ animationDelay: '1.6s' }}>
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto pt-10 px-6 pb-24">
        {/* Desktop Icons Row */}
        <div className="flex gap-8 mb-10 justify-center">
          {[
            { href: '/dashboard', icon: Folder, label: 'My Data', color: 'from-[#b5ead7] to-[#88d8b0]' },
            { href: '/dashboard', icon: Cpu, label: 'Process', color: 'from-[#a0e7e5] to-[#7dd3fc]' },
            { href: '/marketplace', icon: Coins, label: 'Marketplace', color: 'from-[#dbb4f3] to-[#c9a7eb]' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}>
                <item.icon className="w-8 h-8 text-white drop-shadow-sm" />
              </div>
              <span className="text-sm font-medium text-white drop-shadow-md">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Main Window Frame */}
        <div className="bg-[#f5f0f7] rounded-xl shadow-[0_8px_32px_rgba(139,123,168,0.3),inset_-1px_-1px_#b8a8c5,inset_1px_1px_#ffffff] overflow-hidden">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#b4a7d6] to-[#d5a6bd] px-4 py-3 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-white drop-shadow-sm" />
              <span className="text-white text-lg font-bold drop-shadow-sm">INFLECTIV</span>
              <span className="text-white/80 text-sm">- Tokenized Intelligence</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ffeaa7] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#b5ead7] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#ffb7b2] shadow-sm" />
            </div>
          </div>

          {/* Menu Bar */}
          <div className="bg-[#f5f0f7] px-2 py-1.5 border-b border-[#e8e0ed] flex gap-4 text-sm">
            {['File', 'Edit', 'View', 'Help'].map((item) => (
              <span key={item} className="hover:bg-[#e8e0ed] px-3 py-1 cursor-pointer text-[#5a5a5a] font-medium rounded transition-colors">
                {item}
              </span>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-8 bg-gradient-to-br from-[#fff9fb] via-[#fef3f0] to-[#f5f0f7] min-h-[480px] relative">
            {/* Hero Text */}
            <div className="text-center mb-10">
              <h1
                className="text-7xl font-bold mb-5 bg-gradient-to-r from-[#b4a7d6] via-[#d5a6bd] to-[#ffb5c5] bg-clip-text text-transparent"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                INFLECTIV
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-[#fdcb6e]" />
                <p
                  className="text-2xl text-[#8b7ba8]"
                  style={{ fontFamily: 'VT323, monospace' }}
                >
                  TOKENIZED INTELLIGENCE
                </p>
                <Sparkles className="w-5 h-5 text-[#fdcb6e]" />
              </div>
              <p className="text-lg text-[#6b5b7a] max-w-2xl mx-auto leading-relaxed">
                Upload unstructured data. Transform it into structured assets.
                Trade on the AI data marketplace.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Upload, title: 'Upload', desc: 'PDFs, Text, CSVs, and more', color: 'from-[#b5ead7] to-[#a8e6cf]' },
                { icon: Cpu, title: 'Process', desc: 'AI-Powered Structuring', color: 'from-[#a8d8ea] to-[#a0e7e5]' },
                { icon: Coins, title: 'Tokenize', desc: 'Mint & Trade Data Assets', color: 'from-[#dbb4f3] to-[#ffb5c5]' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center shadow-[0_4px_16px_rgba(139,123,168,0.15)] hover:shadow-[0_8px_24px_rgba(139,123,168,0.2)] hover:-translate-y-1 transition-all duration-200"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                    <item.icon className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3d3d3d] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#8b7b9b]">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/auth">
                <button className="bg-gradient-to-r from-[#b4a7d6] to-[#d5a6bd] px-10 py-4 text-white text-lg font-bold rounded-xl shadow-[0_4px_16px_rgba(180,167,214,0.4)] hover:shadow-[0_8px_24px_rgba(180,167,214,0.5)] hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto">
                  <Zap className="w-5 h-5" />
                  Launch App
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#dbb4f3]/30 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#dbb4f3]/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#dbb4f3]/30 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#dbb4f3]/30 rounded-br-lg" />
          </div>

          {/* Status Bar */}
          <div className="bg-[#f5f0f7] px-3 py-2 text-sm flex justify-between border-t border-[#e8e0ed]">
            <span className="px-3 py-1 text-[#8b7b9b] bg-[#e8e0ed]/50 rounded">Ready</span>
            <span className="px-3 py-1 text-[#8b7b9b] bg-[#e8e0ed]/50 rounded">Data Assets: 10,000+</span>
            <span className="px-3 py-1 text-[#8b7b9b] bg-[#e8e0ed]/50 rounded">AI Agents: 500+</span>
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
            INFLECTIV
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e8e0ed]/70 rounded-lg text-sm text-[#5a5a5a]">
          <div className="w-2 h-2 rounded-full bg-[#b5ead7] animate-pulse" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
