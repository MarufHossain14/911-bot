"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Message {
  id: string;
  role: "agent" | "user";
  text: string;
  created_at: string;
}

interface ActiveCall {
  id: string;
  conversation_id: string;
  caller_number: string;
  status: string;
  created_at: string;
}

export default function MonitorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("id");
  
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch all conversations from ElevenLabs API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Map and filter for in-progress calls only
        if (data.conversations) {
          const mapped: ActiveCall[] = data.conversations
            .filter((c: any) => c.status === "in-progress")
            .map((c: any) => ({
              id: c.conversation_id,
              conversation_id: c.conversation_id,
              caller_number: c.metadata?.caller_id || "Web/Other",
              status: c.status,
              created_at: new Date(c.start_time_unix_secs * 1000).toISOString(),
            }));
          
          setActiveCalls(mapped);
          
          if (!selectedCallId && mapped.length > 0) {
            setSelectedCallId(mapped[0].conversation_id);
          }
        }
      } catch (err) {
        console.error("Error fetching ElevenLabs list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    // Poll for the list every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [selectedCallId]);

  // 2. Poll for transcripts for selected call from ElevenLabs
  useEffect(() => {
    if (!selectedCallId) {
      setMessages([]);
      return;
    }

    // Reset messages when switching calls to show loading state
    setMessages([]);

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedCallId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        console.log("Transcript data for", selectedCallId, data);

        if (data.transcript) {
          const mappedMsgs: Message[] = data.transcript.map((t: any, idx: number) => ({
            id: `${selectedCallId}-${idx}`,
            role: t.role === "agent" ? "agent" : "user",
            text: t.message || t.text || "", // Check for both message and text
            created_at: new Date().toISOString(),
          }));
          setMessages(mappedMsgs);
        }
      } catch (err) {
        console.error("Error polling transcript:", err);
      }
    };

    fetchDetail();
    // Poll for transcript every 2 seconds for a faster "real-time" feel
    const interval = setInterval(fetchDetail, 2000);
    return () => clearInterval(interval);
  }, [selectedCallId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer} onClick={() => router.push("/dashboard")} style={{cursor: 'pointer'}}>
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
          </svg>
          <span className={styles.logoText}>Lumina Live Monitor</span>
        </div>
        <div className={styles.statusBadge}>
          <span className={`${styles.statusDot} ${activeCalls.length > 0 ? styles.live : ""}`} />
          {activeCalls.length} ACTIVE {activeCalls.length === 1 ? "CALL" : "CALLS"}
        </div>
      </header>

      <main className={styles.monitorLayout}>
        {/* Sidebar: Active Conversations List */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Active Conversations</h2>
          <div className={styles.callList}>
            {activeCalls.length === 0 && !loading && (
              <div className={styles.emptySidebar}>No active calls</div>
            )}
            {activeCalls.map((call) => (
              <div 
                key={call.id} 
                className={`${styles.callItem} ${selectedCallId === call.conversation_id ? styles.activeItem : ""}`}
                onClick={() => setSelectedCallId(call.conversation_id)}
              >
                <div className={styles.callItemHeader}>
                  <span className={styles.callStatus}>{call.status.toUpperCase()}</span>
                  <span className={styles.callTime}>{new Date(call.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <div className={styles.callCaller}>{call.caller_number || "Incoming..."}</div>
                <div className={styles.callIdSnippet}>{call.conversation_id.substring(0, 12)}...</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main: Selected Conversation Transcript */}
        <section className={styles.transcriptView}>
          {selectedCallId ? (
            <>
              <div className={styles.transcriptHeader}>
                <div>
                  <h3>Monitoring: {activeCalls.find(c => c.conversation_id === selectedCallId)?.caller_number || "Active Session"}</h3>
                  <p className={styles.sessionId}>ID: {selectedCallId}</p>
                </div>
              </div>

              <div className={styles.chatContainer}>
                {messages.length === 0 && (
                  <div className={styles.emptyState}>Waiting for conversation to start...</div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === "user" ? styles.msgUser : styles.msgAgent}>
                    <div className={styles.msgHeader}>
                      <span className={styles.msgRole}>{msg.role === "user" ? "Caller" : "AI Agent"}</span>
                      <span className={styles.msgTime}>{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className={styles.msgText}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>Select a conversation from the sidebar to start monitoring</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
