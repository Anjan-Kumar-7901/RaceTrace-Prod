import React from "react";
import { Article } from "../types";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface NewsSectionProps {
  news: Article[];
  loading: boolean;
}

export default function NewsSection({ news, loading }: NewsSectionProps) {
  return (
    <div 
      className="p-6 rounded-2xl bg-[#151515] border border-white/8 shadow-xl relative overflow-hidden"
      id="f1-news-section"
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#D1D5DB]" />

      <div className="flex items-center justify-between gap-2 mb-6" id="news-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#D1D5DB]/10 rounded-md border border-[#D1D5DB]/20">
            <Newspaper className="w-4 h-4 text-[#D1D5DB]" />
          </div>
          <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
            Latest F1 News
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-sans text-[10px] text-[#9CA3AF] bg-[#101010] px-2.5 py-1 rounded border border-white/4 font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live Updates
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse" id="news-loading-skeleton">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="rounded-xl overflow-hidden bg-[#101010] border border-white/4 h-72 flex flex-col justify-between p-4">
              <div className="w-full bg-white/4 h-32 rounded-lg" />
              <div className="w-3/4 bg-white/4 h-4 mt-4 rounded animate-pulse" />
              <div className="w-full bg-white/4 h-3 mt-2 rounded animate-pulse" />
              <div className="w-1/2 bg-white/4 h-3 mt-2 rounded animate-pulse" />
              <div className="w-1/3 bg-white/4 h-3 mt-auto rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="bg-[#101010] border border-white/8 rounded-lg p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F8FAFC]">
            News feed standby
          </p>
          <p className="font-sans text-sm text-[#9CA3AF] mt-3">
            Curated updates are temporarily unavailable. Try refreshing the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="news-cards-grid">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card group flex flex-col justify-between bg-[#101010] border border-white/8 rounded-lg overflow-hidden transition-all duration-300 relative"
            >
              <div className="p-5" id="news-meta-text">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#F8FAFC] bg-[#D1D5DB]/10 px-1.5 py-0.5 rounded">
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#9CA3AF]">
                      <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      {item.publishedAt}
                    </span>
                  </div>

                  <h4 className="font-editorial font-bold text-xl text-white leading-tight line-clamp-2 mb-2 group-hover:text-[#F8FAFC] transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="font-sans text-sm leading-6 text-[#9CA3AF] line-clamp-3">
                    {item.summary}
                  </p>
              </div>

              <div className="px-5 pb-5 pt-0 flex items-center justify-end font-mono text-[10px] uppercase tracking-wider text-[#9CA3AF] group-hover:text-[#D1D5DB] transition-colors gap-1 font-bold">
                Read full story
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
