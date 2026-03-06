"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PostCard } from "@/components/PostCard";
import { jsonFetch } from "@/lib/client";
import type { PostWithMeta, SafeUser, ToiletWithMeta } from "@/types";

type ProfilePayload = {
  user: SafeUser;
  posts: PostWithMeta[];
  ownedToilets: ToiletWithMeta[];
};

export function ProfileClient({ handle }: { handle: string }) {
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const payload = await jsonFetch<ProfilePayload>(`/api/u/${handle}`);
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [handle]);

  if (loading) return <p className="muted">Loading profile...</p>;
  if (error || !data) return <p className="error-text">{error ?? "Profile unavailable."}</p>;

  return (
    <section className="screen">
      <header className="profile-head">
        <img src={data.user.avatarUrl} alt={data.user.handle} className="avatar lg" />
        <div>
          <h1>@{data.user.handle}</h1>
          <p className="muted">{data.user.bio}</p>
          <p className="tiny">{data.posts.length} posts</p>
        </div>
      </header>

      <h2>Owned toilets</h2>
      {data.ownedToilets.length === 0 ? (
        <p className="muted">No toilet crowns yet.</p>
      ) : (
        <div className="toilet-grid">
          {data.ownedToilets.map((toilet) => (
            <Link key={toilet.id} href={`/toilets/${toilet.id}`} className="toilet-card">
              <h3>{toilet.name}</h3>
              <p className="tiny muted">{toilet.address}</p>
            </Link>
          ))}
        </div>
      )}

      <h2>Posts</h2>
      {data.posts.map((post) => (
        <PostCard key={post.id} post={post} onRefresh={load} />
      ))}
    </section>
  );
}
