"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";
import type {
  SupportThreadWithMeta,
  SupportThreadWithMessages,
  SupportMessage,
} from "@/modules/support/domain/thread";
import { sendNewMessage } from "@/modules/support/application/send-new-message";
import { replyToThread } from "@/modules/support/application/reply-to-thread";
import { markThreadRead } from "@/modules/support/application/mark-thread-read";
import { BODY_MAX } from "@/modules/support/domain/validators";

type Mode = "anon" | "user" | "admin";

interface PollResp {
  authenticated: boolean;
  isAdmin?: boolean;
  unread?: number;
  threads?: SupportThreadWithMeta[];
  thread?: SupportThreadWithMessages | null;
}

export function ChatPanel({
  mode,
  open,
  onStateChange,
}: {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onStateChange?: (unread: number) => void;
}) {
  if (mode === "anon") return <AnonCta />;
  if (mode === "user")
    return <UserChat open={open} onStateChange={onStateChange} />;
  return <AdminChat open={open} onStateChange={onStateChange} />;
}

// ─── Anon ────────────────────────────────────────────────
function AnonCta() {
  const t = useTranslations("support.chat");
  return (
    <div className="chat-anon">
      <div className="chat-anon-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 12a8 8 0 0 1-11.8 7L4 20l1-5.2A8 8 0 1 1 21 12z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="chat-anon-title">{t("anonTitle")}</h3>
      <p className="chat-anon-sub">
        {t("anonDesc")}
      </p>
      <ul className="chat-anon-bullets">
        <li>{t("anonBullet1")}</li>
        <li>{t("anonBullet2")}</li>
        <li>{t("anonBullet3")}</li>
      </ul>
      <Link href="/login" className="chat-anon-cta">
        {t("anonCta")}
      </Link>
      <p className="chat-anon-fineprint">{t("anonFineprint")}</p>
    </div>
  );
}

// ─── User: single live chat with coach ─────────────────
function UserChat({
  open,
  onStateChange,
}: {
  open: boolean;
  onStateChange?: (unread: number) => void;
}) {
  const t = useTranslations("support.chat");
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const poll = useCallback(async () => {
    try {
      const url = threadId
        ? `/api/support/poll?thread=${threadId}`
        : "/api/support/poll";
      const res = await fetch(url, { cache: "no-store" });
      const json: PollResp = await res.json();
      if (!json.authenticated) return;

      onStateChange?.(json.unread ?? 0);

      if (json.thread) {
        setThread(json.thread);
      } else if (!threadId) {
        // Pick most recent open thread automatically
        const open = (json.threads ?? []).find((t) => t.status === "open");
        const fallback = (json.threads ?? [])[0];
        const pick = open ?? fallback;
        if (pick) {
          setThreadId(pick.id);
        } else {
          setThread(null);
        }
      }
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, [threadId, onStateChange]);

  useEffect(() => {
    if (!open) {
      setThread(null);
      setThreadId(null);
      setLoaded(false);
      setError(null);
      return;
    }
    poll();
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, [open, poll]);

  useEffect(() => {
    if (threadId) markThreadRead(threadId).catch(() => {});
  }, [threadId]);

  useEffect(() => {
    if (!thread?.messages.length) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight }));
  }, [thread?.messages.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      if (thread && thread.thread.status === "open") {
        const res = await replyToThread({
          threadId: thread.thread.id,
          body: text,
        });
        if (res.error) {
          setError(res.error);
          return;
        }
      } else {
        const res = await sendNewMessage({ body: text });
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.threadId) setThreadId(res.threadId);
      }
      setBody("");
      await poll();
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-live">
      <header className="chat-live-head">
        <div className="chat-live-avatar">A</div>
        <div className="min-w-0">
          <p className="chat-live-name">ATHLEX</p>
          <p className="chat-live-status">{t("userStatus")}</p>
        </div>
      </header>

      <div ref={scrollRef} className="chat-live-messages">
        {!loaded && <Placeholder t={t} />}
        {loaded && !thread && <WelcomeMessage t={t} />}
        {loaded && thread && thread.messages.length === 0 && <WelcomeMessage t={t} />}
        {thread?.messages.map((m) => (
          <Bubble key={m.id} message={m} mine={m.author === "user"} />
        ))}
      </div>

      {thread?.thread.status === "closed" ? (
        <div className="chat-live-reopen">
          <p>{t("threadClosed")}</p>
          <button
            type="button"
            onClick={() => {
              setThreadId(null);
              setThread(null);
              inputRef.current?.focus();
            }}
            className="chat-live-reopen-btn"
          >
            {t("reopenBtn")}
          </button>
        </div>
      ) : (
        <Composer
          body={body}
          setBody={setBody}
          onSubmit={submit}
          sending={sending}
          error={error}
          inputRef={inputRef}
          t={t}
        />
      )}
    </div>
  );
}

// ─── Admin: inbox + chat view ──────────────────────────
function AdminChat({
  open,
  onStateChange,
}: {
  open: boolean;
  onStateChange?: (unread: number) => void;
}) {
  const t = useTranslations("support.chat");
  const [threads, setThreads] = useState<SupportThreadWithMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const poll = useCallback(async () => {
    try {
      const url = activeId
        ? `/api/support/poll?thread=${activeId}`
        : "/api/support/poll";
      const res = await fetch(url, { cache: "no-store" });
      const json: PollResp = await res.json();
      if (!json.authenticated || !json.isAdmin) return;
      setThreads(json.threads ?? []);
      if (activeId) setThread(json.thread ?? null);
      onStateChange?.(json.unread ?? 0);
    } catch {}
  }, [activeId, onStateChange]);

  useEffect(() => {
    if (!open) {
      setActiveId(null);
      setThread(null);
      setError(null);
      setBody("");
      return;
    }
    poll();
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, [open, poll]);

  useEffect(() => {
    if (activeId) markThreadRead(activeId).catch(() => {});
  }, [activeId]);

  useEffect(() => {
    if (!thread?.messages.length) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight }));
  }, [thread?.messages.length, activeId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!thread) return;
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    const res = await replyToThread({ threadId: thread.thread.id, body: text });
    setSending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setBody("");
    await poll();
    inputRef.current?.focus();
  }

  if (!activeId) {
    return (
      <div className="chat-inbox">
        <header className="chat-inbox-head">
          <div>
            <h3 className="chat-inbox-title">{t("inboxTitle")}</h3>
            <p className="chat-inbox-sub">
              {threads.length === 1 ? t("inboxSubSingular") : t("inboxSubPlural", { count: threads.length })}
            </p>
          </div>
        </header>
        <div className="chat-inbox-list">
          {threads.length === 0 && (
            <p className="chat-empty-admin">{t("inboxEmpty")}</p>
          )}
          {threads.map((thread) => {
            const unread = thread.unread_for_admin;
            const date = new Date(
              thread.last_message_at ?? thread.updated_at
            ).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={`chat-thread-row ${unread ? "is-unread" : ""}`}
              >
                <div className="chat-thread-top">
                  <span className="chat-thread-subject">{thread.subject}</span>
                  {unread && <span className="chat-thread-dot" />}
                </div>
                {thread.user_email && (
                  <span className="chat-thread-meta">{thread.user_email}</span>
                )}
                {thread.last_message_preview && (
                  <span className="chat-thread-preview">
                    {thread.last_message_author === "admin" ? t("adminTuLabel") : ""}
                    {thread.last_message_preview}
                  </span>
                )}
                <span className="chat-thread-date">{date}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-live">
      <header className="chat-live-head">
        <button
          type="button"
          onClick={() => {
            setActiveId(null);
            setThread(null);
          }}
          className="chat-back-btn"
          aria-label={t("adminBackBtn")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="chat-live-avatar">
          {(thread?.user_email?.[0] ?? "U").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="chat-live-name truncate">
            {thread?.user_email ?? "Usuario"}
          </p>
          {thread && (
            <p className="chat-live-status truncate">{thread.thread.subject}</p>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="chat-live-messages">
        {!thread && <Placeholder t={t} />}
        {thread?.messages.map((m) => (
          <Bubble key={m.id} message={m} mine={m.author === "admin"} />
        ))}
      </div>

      {thread?.thread.status === "closed" ? (
        <div className="chat-live-reopen">
          <p>{t("adminClosedMsg")}</p>
        </div>
      ) : (
        <Composer
          body={body}
          setBody={setBody}
          onSubmit={submit}
          sending={sending}
          error={error}
          inputRef={inputRef}
          t={t}
        />
      )}
    </div>
  );
}

// ─── Shared pieces ────────────────────────────────────
function Bubble({ message, mine }: { message: SupportMessage; mine: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className={`chat-msg ${mine ? "is-mine" : "is-theirs"}`}>
      <div className="chat-msg-bubble">
        {message.body}
        <span className="chat-msg-time">{time}</span>
      </div>
    </div>
  );
}

function WelcomeMessage({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="chat-msg is-theirs">
      <div className="chat-msg-bubble">
        {t("welcomeMsg")}
      </div>
    </div>
  );
}

function Placeholder({ t }: { t: ReturnType<typeof useTranslations> }) {
  return <p className="chat-placeholder">{t("loading")}</p>;
}

function Composer({
  body,
  setBody,
  onSubmit,
  sending,
  error,
  inputRef,
  t,
}: {
  body: string;
  setBody: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  t: ReturnType<typeof useTranslations>;
}) {
  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
    }
  }
  return (
    <>
      {error && <p className="chat-err chat-err-inline">{error}</p>}
      <form onSubmit={onSubmit} className="chat-composer" autoComplete="off">
        <textarea
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKey}
          maxLength={BODY_MAX}
          rows={3}
          placeholder={t("placeholder")}
          className="chat-composer-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="send"
          name="chat-message"
          data-1p-ignore
          data-lpignore="true"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="chat-composer-send"
          aria-label={t("sendAriaLabel")}
        >
          {sending ? (
            "…"
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 12l16-7-7 16-2-7-7-2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </>
  );
}
