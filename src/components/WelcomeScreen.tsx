import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onContinue: (name: string) => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to proceed");
      return;
    }
    onContinue(name.trim());
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#080808] p-4 overflow-hidden">
      {/* Decorative simple radial background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[500px] h-[500px] bg-[#D1D5DB]/5 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10 p-8 rounded-2xl bg-[#151515] border border-white/8 text-center shadow-2xl"
        id="welcome-card"
      >
        {/* Simple Top Indicator Line */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#D1D5DB] rounded-t-2xl" />

        {/* Brand Icon */}
        <div className="flex justify-center mb-5" id="welcome-logo">
          <div className="w-20 h-20 bg-black rounded-2xl border border-white/12 overflow-hidden flex items-center justify-center shadow-[0_0_22px_rgba(239,255,0,0.14)]">
            <img src="/racetrace-icon.png" alt="Race Trace" className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-black text-white tracking-wide uppercase mb-1">
          RACE TRACE
        </h1>
        <p className="font-sans text-xs uppercase tracking-widest text-[#9CA3AF] mb-6">
          Your Personal Formula 1 Hub
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-[#9CA3AF] block mb-2 font-medium">
              What is your name?
            </label>
            <input
              id="name-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full bg-[#101010] border border-white/8 rounded-lg py-2.5 px-4 font-sans text-white placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#D1D5DB] focus:ring-1 focus:ring-[#D1D5DB] transition-all text-center"
            />
            {error && (
              <p className="text-[#F8FAFC] text-xs mt-2 text-center">
                ⚠️ {error}
              </p>
            )}
          </div>

          <button
            id="continue-button"
            type="submit"
            className="w-full font-sans uppercase tracking-wider font-bold py-3 px-4 bg-[#D1D5DB] text-black hover:bg-[#F8FAFC] active:bg-[#E5E7EB] rounded-lg transition-colors text-xs flex items-center justify-center gap-2 group cursor-pointer"
          >
            Show Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/8 flex items-center justify-center">
          <span className="footer-signature">
            Made By <strong>Anjan</strong>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
