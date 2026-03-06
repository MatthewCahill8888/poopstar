"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useGeoLocation } from "@/components/useGeo";
import { jsonFetch } from "@/lib/client";
import type { ToiletWithMeta } from "@/types";

export function PostComposer() {
  const geo = useGeoLocation();
  const [caption, setCaption] = useState("");
  const [toiletId, setToiletId] = useState("");
  const [toilets, setToilets] = useState<ToiletWithMeta[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cartoonUrl, setCartoonUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (geo.lat !== undefined && geo.lng !== undefined) {
      params.set("lat", String(geo.lat));
      params.set("lng", String(geo.lng));
    }
    jsonFetch<{ toilets: ToiletWithMeta[] }>(`/api/toilets?${params.toString()}`)
      .then((data) => setToilets(data.toilets))
      .catch(() => setToilets([]));
  }, [geo.lat, geo.lng]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setCartoonUrl(null);
    setMessage(null);
    if (chosen) {
      setOriginalUrl(URL.createObjectURL(chosen));
    } else {
      setOriginalUrl(null);
    }
  }

  async function onGenerateAndPost(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      if (!file) {
        throw new Error("Select a photo first.");
      }
      if (geo.lat === undefined || geo.lng === undefined) {
        throw new Error("Allow geolocation to post nearby.");
      }

      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const uploadData = (await uploadRes.json()) as { url?: string; error?: string };
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error ?? "Upload failed.");
      }

      const aiData = await jsonFetch<{ cartoonUrl: string }>("/api/ai/cartoon", {
        method: "POST",
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });
      setCartoonUrl(aiData.cartoonUrl);

      await jsonFetch<{ post: { id: string } }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          originalImageUrl: uploadData.url,
          cartoonImageUrl: aiData.cartoonUrl,
          caption,
          toiletId: toiletId || undefined,
          lat: geo.lat,
          lng: geo.lng,
        }),
      });

      setMessage("Posted. Your cartoon poop is live in nearby feed.");
      setCaption("");
      setToiletId("");
      setFile(null);
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : "Could not post.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="screen">
      <h1>Create poop post</h1>
      <p className="muted">
        Upload on the toilet, auto-pick nearby location, generate a brainrot cartoon,
        and compete for toilet ownership.
      </p>
      <form className="stack" onSubmit={onGenerateAndPost}>
        <input type="file" accept="image/*" onChange={onFileChange} className="input" />
        <textarea
          className="input"
          rows={3}
          placeholder="Caption this masterpiece"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
        <select
          className="input"
          value={toiletId}
          onChange={(event) => setToiletId(event.target.value)}
        >
          <option value="">Auto-pick nearest toilet</option>
          {toilets.slice(0, 10).map((toilet) => (
            <option key={toilet.id} value={toilet.id}>
              {toilet.name}
              {toilet.distanceKm !== undefined
                ? ` (${toilet.distanceKm.toFixed(2)}km)`
                : ""}
            </option>
          ))}
        </select>
        <button className="primary-btn" type="submit" disabled={pending}>
          {pending ? "Generating + posting..." : "Generate cartoon and post"}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
      </form>

      <div className="preview-grid">
        <div>
          <p className="tiny muted">Original</p>
          {originalUrl ? (
            <img src={originalUrl} alt="Original upload preview" className="preview-image" />
          ) : (
            <div className="empty-preview">No image</div>
          )}
        </div>
        <div>
          <p className="tiny muted">AI cartoon</p>
          {cartoonUrl ? (
            <img src={cartoonUrl} alt="AI cartoon preview" className="preview-image" />
          ) : (
            <div className="empty-preview">Generate to preview</div>
          )}
        </div>
      </div>
    </section>
  );
}
