"use client";

import { useCallback, useEffect, useState } from "react";

import { PostCard } from "@/components/PostCard";
import { useGeoLocation } from "@/components/useGeo";
import { DEFAULT_NEARBY_RADIUS_KM } from "@/lib/constants";
import { jsonFetch } from "@/lib/client";
import type { PostWithMeta } from "@/types";

export function FeedClient() {
  const geo = useGeoLocation();
  const [radiusKm, setRadiusKm] = useState(DEFAULT_NEARBY_RADIUS_KM);
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (geo.lat !== undefined && geo.lng !== undefined) {
        params.set("lat", String(geo.lat));
        params.set("lng", String(geo.lng));
      }
      params.set("radiusKm", String(radiusKm));
      const data = await jsonFetch<{ posts: PostWithMeta[] }>(
        `/api/posts?${params.toString()}`,
      );
      setPosts(data.posts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load feed.");
    } finally {
      setLoading(false);
    }
  }, [geo.lat, geo.lng, radiusKm]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <section className="screen">
      <div className="section-head">
        <h1>Nearby poops</h1>
        <div className="inline">
          <label className="tiny muted" htmlFor="radius">
            Radius
          </label>
          <select
            id="radius"
            className="input compact"
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
          >
            <option value={1}>1km</option>
            <option value={3}>3km</option>
            <option value={10}>10km</option>
            <option value={999}>All</option>
          </select>
        </div>
      </div>
      <p className="muted">
        {geo.loading
          ? "Getting your location..."
          : geo.error
            ? `Location off (${geo.error}). Showing general feed.`
            : "Live nearby feed based on your geolocation."}
      </p>

      {loading ? <p className="muted">Loading feed...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && posts.length === 0 ? (
        <p className="muted">No poop drops in this radius yet. Be the first.</p>
      ) : null}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onRefresh={() => void loadPosts()} />
      ))}
    </section>
  );
}
