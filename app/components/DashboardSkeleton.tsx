import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              <div className="h-9 w-48 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 min-w-[100px]">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-12 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 min-w-[100px]">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Skeleton */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-11 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Main Content with Sidebar Skeleton */}
      <div className="max-w-7xl mx-auto flex gap-6 relative">
        {/* Main Content Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Card Header Skeleton */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-5 w-20 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* AI Score Section Skeleton */}
                <div className="p-5 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Technical Details Skeleton */}
                <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-slate-50">
                    <div className="h-3 w-8 bg-slate-200 rounded animate-pulse mb-1"></div>
                    <div className="h-5 w-12 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="h-3 w-8 bg-slate-200 rounded animate-pulse mb-1"></div>
                    <div className="h-5 w-12 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="h-3 w-8 bg-slate-200 rounded animate-pulse mb-1"></div>
                    <div className="h-5 w-12 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 w-12 bg-slate-200 rounded animate-pulse mb-3"></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>

            {/* Stats Summary Skeleton */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-3"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

