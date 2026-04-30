"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

type CallRecord = {
  id: string;
  created_at: string;
  original_text: string | null;
  translated_text: string | null;
  language_code: string | null;
  language_name?: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function CallDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRecord = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("call_records")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!active) return;

      if (error) {
        setError(error.message);
        setRecord(null);
      } else {
        setRecord(data as CallRecord);
      }

      setLoading(false);
    };

    loadRecord();

    return () => {
      active = false;
    };
  }, [params.id, router]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
        <div className={styles.logo}>Lumina</div>
      </header>

      <main className={styles.main}>
        {loading && <div className={styles.panel}>Loading call record...</div>}

        {!loading && error && (
          <div className={styles.panel}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && !record && (
          <div className={styles.panel}>Call record not found.</div>
        )}

        {record && (
          <>
            <section className={styles.summary}>
              <div>
                <p className={styles.eyebrow}>Call Record</p>
                <h1 className={styles.title}>{formatDate(record.created_at)}</h1>
              </div>
              <div className={styles.languagePill}>
                {record.language_name || record.language_code || "Unknown language"}
              </div>
            </section>

            <section className={styles.grid}>
              <article className={styles.transcriptPanel}>
                <div className={styles.panelHeader}>
                  <h2>Original Transcript</h2>
                </div>
                <p className={styles.transcript}>
                  {record.original_text || "No original transcript was saved."}
                </p>
              </article>

              <article className={styles.transcriptPanel}>
                <div className={styles.panelHeader}>
                  <h2>Translation / Notes</h2>
                </div>
                <p className={styles.transcript}>
                  {record.translated_text || "No translated transcript was saved."}
                </p>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
