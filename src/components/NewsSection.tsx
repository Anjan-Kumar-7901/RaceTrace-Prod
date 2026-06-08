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
      className="p-6 rounded-2xl bg-[#18181B] border border-white/8 shadow-xl relative overflow-hidden"
      id="f1-news-section"
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F59E0B]" />

      <div className="flex items-center justify-between gap-2 mb-6" id="news-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F59E0B]/10 rounded-md border border-[#F59E0B]/20">
            <Newspaper className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
            Latest F1 News
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-sans text-[10px] text-[#A1A1AA] bg-[#111114] px-2.5 py-1 rounded border border-white/4 font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live Updates
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse" id="news-loading-skeleton">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="rounded-xl overflow-hidden bg-[#111114] border border-white/4 h-72 flex flex-col justify-between p-4">
              <div className="w-full bg-white/4 h-32 rounded-lg" />
              <div className="w-3/4 bg-white/4 h-4 mt-4 rounded animate-pulse" />
              <div className="w-full bg-white/4 h-3 mt-2 rounded animate-pulse" />
              <div className="w-1/2 bg-white/4 h-3 mt-2 rounded animate-pulse" />
              <div className="w-1/3 bg-white/4 h-3 mt-auto rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
          id="news-cards-grid"
        >
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between bg-[#111114] border border-white/8 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#F59E0B]/60 hover:bg-[#1E1E22] hover:-translate-y-1 relative"
            >
              <div>
                {/* News Art Cover */}
                <div className="relative h-36 bg-[#09090B] overflow-hidden" id="news-cover">
                  <img
                    referrerPolicy="no-referrer"
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-4" id="news-meta-text">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-[#FBBF24] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1 font-sans text-[10px] text-[#A1A1AA]">
                      <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" />
                      {item.publishedAt}
                    </span>
                  </div>

                  <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wide leading-tight line-clamp-2 mb-2 group-hover:text-[#FBBF24] transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="font-sans text-[11px] text-[#A1A1AA] line-clamp-3">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 mt-3 flex items-center justify-end font-sans text-[10px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#F59E0B] transition-colors gap-1 font-bold">
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
