'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SkeletonCard } from '../../components/admin/SkeletonLoader';

// ============================================================================
// BESPOKE CUSTOM GEOMETRIC SVG ICONS (Gradient-free, Sharp, Heavy-mitre)
// ============================================================================

const CustomUsersIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="square" 
    strokeLinejoin="miter" 
    className={className}
  >
    <rect x="3" y="14" width="7" height="7" />
    <circle cx="6.5" cy="7.5" r="3.5" />
    <rect x="14" y="14" width="7" height="7" />
    <circle cx="17.5" cy="7.5" r="3.5" />
  </svg>
);

const CustomCheckCircleIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="square" 
    strokeLinejoin="miter" 
    className={className}
  >
    <polygon points="22 4 12 14.01 9 11.01 6 14 12 20 22 7" />
  </svg>
);

const CustomCalendarPlusIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="square" 
    strokeLinejoin="miter" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="12" y1="14" x2="12" y2="18" />
    <line x1="10" y1="16" x2="14" y2="16" />
  </svg>
);

// ============================================================================
// ADMIN OVERVIEW PAGE COMPONENT
// ============================================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    todayRegistrations: 0,
    totalEntriesToday: 0,
    loading: true
  });

  useEffect(() => {
    const unsubRegs = onSnapshot(collection(db, 'registrations'), (snap) => {
      setStats(s => ({ ...s, totalRegistrations: snap.size, loading: false }));
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch new registrations created today
    const unsubTodayRegs = onSnapshot(query(collection(db, 'registrations'), where('createdAt', '>=', today)), (snap) => {
      setStats(s => ({ ...s, todayRegistrations: snap.size }));
    });

    // Fetch entries today
    const unsubScans = onSnapshot(query(collection(db, 'scanLogs'), where('timestamp', '>=', today), where('result', '==', 'accepted')), (snap) => {
      setStats(s => ({ ...s, totalEntriesToday: snap.size }));
    });

    return () => {
      unsubRegs();
      unsubTodayRegs();
      unsubScans();
    };
  }, []);

  return (
    <div className="space-y-10 select-none">
      {/* Title Header */}
      <div>
        <h1 className="font-adminHeading text-3xl font-black uppercase tracking-tight text-brand-ink mb-1.5">Overview</h1>
        <p className="text-admin-muted font-bold text-xs uppercase tracking-wider">Live snapshot of Aarambh 2026</p>
      </div>

      {/* Quick Statistics Grid */}
      {stats.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Registrations */}
          <div className="bg-admin-surface border-4 border-brand-ink p-6 rounded-md shadow-[4px_4px_0px_0px_#030404] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#030404]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-admin-muted">Total Registrations</h3>
              <div className="p-2 border-2 border-brand-ink bg-brand-cloud text-brand-ink rounded-md">
                <CustomUsersIcon size={18} />
              </div>
            </div>
            <p className="font-adminHeading text-4xl font-black text-brand-ink">{stats.totalRegistrations}</p>
          </div>
          
          {/* Card 2: Today's Registrations */}
          <div className="bg-admin-surface border-4 border-brand-ink p-6 rounded-md shadow-[4px_4px_0px_0px_#030404] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#030404]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-admin-muted">Today&apos;s Registrations</h3>
              <div className="p-2 border-2 border-brand-ink bg-brand-orange/15 text-brand-orange rounded-md">
                <CustomCalendarPlusIcon size={18} />
              </div>
            </div>
            <p className="font-adminHeading text-4xl font-black text-brand-ink">{stats.todayRegistrations}</p>
          </div>

          {/* Card 3: Entries Today */}
          <div className="bg-admin-surface border-4 border-brand-ink p-6 rounded-md shadow-[4px_4px_0px_0px_#030404] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#030404]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-admin-muted">Entries Today</h3>
              <div className="p-2 border-2 border-brand-ink bg-green-100 text-green-700 rounded-md">
                <CustomCheckCircleIcon size={18} />
              </div>
            </div>
            <p className="font-adminHeading text-4xl font-black text-brand-ink">{stats.totalEntriesToday}</p>
          </div>
        </div>
      )}
    </div>
  );
}
