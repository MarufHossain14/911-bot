"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

export default function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email ?? "User");
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        router.push("/");
      }
    });

    // Initial check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "User");
        setLoading(false);
        fetchHistory();
      } else {
        const timeout = setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            router.push("/");
          } else {
            setUserEmail(session.user.email ?? "User");
            setLoading(false);
            fetchHistory();
          }
        }, 1500);
        return () => clearTimeout(timeout);
      }
    };

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("call_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (!error && data) {
        setHistory(data);
      }
    };

    checkUser();

    // ── Supabase Realtime for Incoming Calls ───────────────────────────────────
    
    const callsChannel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'active_calls' },
        (payload) => {
          console.log('New incoming call:', payload);
          setIncomingCall(payload.new);
          
          // Play a sound if possible
          try {
            const audio = new Audio('/ringtone.mp3'); // User needs to provide this or use a beep
            audio.play().catch(() => {});
          } catch (e) {}
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'active_calls' },
        (payload) => {
          if (payload.new.status === 'ended') {
            setIncomingCall(null);
          }
        }
      )
      .subscribe();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(callsChannel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  const CallHistory = () => {
    if (history.length === 0) {
      return <p className={styles.emptyHistory}>No recent conversations found.</p>;
    }

    return (
      <div className={styles.historyList}>
        {history.map((record) => (
          <div key={record.id} className={styles.historyCard}>
            <div className={styles.cardInfo}>
              <span className={styles.cardTime}>
                {new Date(record.created_at).toLocaleString()}
              </span>
              <p className={styles.cardTranscript}>
                {record.original_text.substring(0, 100)}...
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.phoneIconContainer}>
            <div className={styles.translateDots}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          </div>
          <h1 className={styles.title}>Verifying session...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
          </svg>
          <span className={styles.logoText}>Lumina</span>
        </div>

        <div className={styles.headerActions}>
          <Link href="/monitor" className={styles.monitorLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Live Monitor
          </Link>
          
          <div className={styles.avatarContainer} ref={dropdownRef}>
          <button 
            className={styles.avatarBtn} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className={styles.avatar}>
              <Image src="/abstract_bg.png" alt="User Avatar" width={40} height={40} style={{objectFit: 'cover'}} />
            </div>
          </button>

          {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <span className={styles.dropdownUsername}>{userEmail}</span>
                </div>
                <div className={styles.dropdownDivider}></div>
                <Link href="/admin" className={styles.dropdownItemPrimary}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  Admin Analytics
                </Link>
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </div>
          )}
        </div>
      </div>
    </header>

      <main className={styles.mainContent}>
        {/* Incoming Call Modal Overlay */}
        {incomingCall && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.ringingAnim}>
                <div className={styles.ringCircle}></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h2 className={styles.modalTitle}>Incoming Call</h2>
              <p className={styles.modalSubtitle}>From: {incomingCall.caller_number || "Unknown Number"}</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.declineBtn}
                  onClick={() => setIncomingCall(null)}
                >
                  Decline
                </button>
                <Link 
                  href={`/call?id=${incomingCall.conversation_id}`}
                  className={styles.acceptBtn}
                  onClick={() => setIncomingCall(null)}
                >
                  Accept
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className={styles.statusPill}>
          <span className={styles.statusDot}></span>
          Live: Listening for calls
        </div>

        <div className={styles.phoneIconContainer}>
          <svg className={styles.phoneIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <div className={styles.translateDots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>

        <h1 className={styles.title}>Waiting for incoming calls...</h1>
        
        <div className={styles.actionButtons}>
          <Link href="/incoming" className={styles.normalCallBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Normal Call
          </Link>
          <Link href="/incoming" className={styles.translateCallBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
            </svg>
            Translate Call
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <CallHistory />
        </div>

        <p className={styles.footerNote}>
          FOR TESTING PURPOSES ONLY
        </p>
      </main>
    </div>
  );
}
