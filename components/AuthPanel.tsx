"use client";

import { FormEvent, useEffect, useState } from "react";

import { jsonFetch } from "@/lib/client";
import type { SafeUser } from "@/types";

type AuthMode = "login" | "register";

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jsonFetch<{ user: SafeUser }>("/api/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "register") {
        const data = await jsonFetch<{ user: SafeUser }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, handle }),
        });
        setUser(data.user);
      } else {
        const data = await jsonFetch<{ user: SafeUser }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
      }
      setPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Auth failed");
    } finally {
      setPending(false);
    }
  }

  async function logout(): Promise<void> {
    setPending(true);
    try {
      await jsonFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
      setUser(null);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <p className="muted">Checking session...</p>;
  }

  if (user) {
    return (
      <div className="auth-user">
        <img src={user.avatarUrl} alt={user.handle} className="avatar sm" />
        <div>
          <p className="auth-handle">@{user.handle}</p>
          <p className="muted tiny">{user.emailMasked}</p>
        </div>
        <button className="ghost-btn" type="button" onClick={logout} disabled={pending}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-switch">
        <button
          type="button"
          className={mode === "login" ? "chip active" : "chip"}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "chip active" : "chip"}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>
      {mode === "register" ? (
        <input
          className="input"
          placeholder="Handle"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          required
        />
      ) : null}
      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button className="primary-btn" type="submit" disabled={pending}>
        {pending ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
      </button>
      {error ? <p className="error-text">{error}</p> : null}
      <p className="muted tiny">Demo login: alex@example.com / password123</p>
    </form>
  );
}
