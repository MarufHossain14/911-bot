import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function CallScreen() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatar}>
          <Image src="/abstract_bg.png" alt="User" width={32} height={32} style={{objectFit: 'cover'}} />
        </div>
        <div className={styles.logoContainer}>
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
          </svg>
          <span className={styles.logoText}>Lumina Translate</span>
        </div>
        <button className={styles.settingsBtn}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.callerInfo}>
          <div className={styles.callerAvatarWrapper}>
            <div className={styles.halo}></div>
            <div className={styles.callerAvatar}>
              <Image src="/sofia_portrait.png" alt="Sofia Chen" fill style={{objectFit: 'cover'}} />
            </div>
          </div>
          <h1 className={styles.callerName}>Sofia Chen</h1>
          <div className={styles.callStatusRow}>
            <span className={styles.statusDot}></span>
            <span className={styles.statusText}>Call in Progress — 04:12</span>
          </div>
        </div>

        <div className={styles.translationCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>LIVE TRANSLATION</span>
            <div className={styles.languagePair}>
              <span className={styles.lang}>EN</span>
              <svg className={styles.swapIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10h14M21 10l-4-4M17 14H3M3 14l4 4"/>
              </svg>
              <span className={styles.langGreen}>ZH</span>
            </div>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.messageGroupLeft}>
              <div className={styles.bubbleSourceLeft}>
                Hello, can you hear me clearly?
              </div>
              <div className={styles.bubbleTargetLeft}>
                你好，你能听清楚我的声音吗？
              </div>
              <div className={styles.messageTimeLeft}>10:42 AM</div>
            </div>

            <div className={styles.messageGroupRight}>
              <div className={styles.bubbleSourceRight}>
                Yes, I can. The connection is stable.
              </div>
              <div className={styles.bubbleTargetRight}>
                是的，我可以。连接很稳定。
              </div>
              <div className={styles.messageTimeRight}>10:42 AM</div>
            </div>

            <div className={styles.messageGroupLeft}>
              <div className={styles.bubbleSourceLeft}>
                Great. Let's discuss the project requirements.
              </div>
              <div className={styles.bubbleTargetLeft}>
                太好了。让我们讨论一下项目的要求。
              </div>
              <div className={styles.messageTimeLeft}>10:43 AM</div>
            </div>

            <div className={styles.loadingDots}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className={styles.endCallBtn}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
            <line x1="23" y1="1" x2="1" y2="23"/>
          </svg>
          End Call
        </Link>
      </main>
    </div>
  );
}
