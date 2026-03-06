"use client";

import { FormEvent, useEffect, useState } from "react";

import { PostCard } from "@/components/PostCard";
import { jsonFetch } from "@/lib/client";
import type { PostWithMeta, ToiletRating, ToiletWithMeta } from "@/types";

type ToiletPayload = {
  toilet: ToiletWithMeta;
  posts: PostWithMeta[];
  ratings: ToiletRating[];
};

type RatingForm = {
  cleanliness: number;
  privacy: number;
  paper: number;
  vibe: number;
};

const INITIAL_FORM: RatingForm = {
  cleanliness: 4,
  privacy: 4,
  paper: 4,
  vibe: 4,
};

export function ToiletDetailClient({ toiletId }: { toiletId: string }) {
  const [data, setData] = useState<ToiletPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RatingForm>(INITIAL_FORM);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await jsonFetch<ToiletPayload>(`/api/toilets/${toiletId}`);
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load toilet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [toiletId]);

  async function submitRating(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await jsonFetch<{ rating: ToiletRating }>(`/api/toilets/${toiletId}/rate`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not rate.");
    }
  }

  if (loading) {
    return <p className="muted">Loading toilet details...</p>;
  }
  if (error || !data) {
    return <p className="error-text">{error ?? "Toilet not found."}</p>;
  }

  return (
    <section className="screen">
      <h1>{data.toilet.name}</h1>
      <p className="muted">{data.toilet.address}</p>
      <p className="tiny">
        ⭐ {data.toilet.ratingAverage || 0} ({data.toilet.ratingCount} ratings) · Owner:{" "}
        {data.toilet.topPoopOwnerHandle
          ? `@${data.toilet.topPoopOwnerHandle}`
          : "Unclaimed"}
      </p>
      <p className="tiny muted">
        {data.toilet.openingHours} · {data.toilet.accessibility} ·{" "}
        {data.toilet.genderNeutral ? "Gender neutral" : "Gendered"}
      </p>

      <form className="rating-form" onSubmit={submitRating}>
        {(["cleanliness", "privacy", "paper", "vibe"] as const).map((key) => (
          <label key={key} className="stack tiny">
            {key}
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={form[key]}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [key]: Number(event.target.value) }))
              }
            />
          </label>
        ))}
        <button className="primary-btn" type="submit">
          Submit rating
        </button>
      </form>

      <h2>Poops from this toilet</h2>
      {data.posts.length === 0 ? (
        <p className="muted">No poop posts yet. Be first to claim it.</p>
      ) : (
        data.posts.map((post) => <PostCard key={post.id} post={post} onRefresh={load} />)
      )}
    </section>
  );
}
