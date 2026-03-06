"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useGeoLocation } from "@/components/useGeo";
import { jsonFetch } from "@/lib/client";
import type { ToiletWithMeta } from "@/types";

export function ToiletsClient() {
  const geo = useGeoLocation();
  const [toilets, setToilets] = useState<ToiletWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (geo.lat !== undefined && geo.lng !== undefined) {
      params.set("lat", String(geo.lat));
      params.set("lng", String(geo.lng));
    }
    jsonFetch<{ toilets: ToiletWithMeta[] }>(`/api/toilets?${params.toString()}`)
      .then((data) => setToilets(data.toilets))
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Failed to load toilets."),
      )
      .finally(() => setLoading(false));
  }, [geo.lat, geo.lng]);

  return (
    <section className="screen">
      <h1>Toilets nearby</h1>
      <p className="muted">Rate toilets and chase top poop ownership badges.</p>
      {loading ? <p className="muted">Loading toilets...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="toilet-grid">
        {toilets.map((toilet) => (
          <Link key={toilet.id} href={`/toilets/${toilet.id}`} className="toilet-card">
            <h2>{toilet.name}</h2>
            <p className="muted tiny">{toilet.address}</p>
            <p className="tiny">
              ⭐ {toilet.ratingAverage || 0} ({toilet.ratingCount}) · {toilet.postCount} poops
            </p>
            <p className="tiny">
              Owner: {toilet.topPoopOwnerHandle ? `@${toilet.topPoopOwnerHandle}` : "Unclaimed"}
            </p>
            {toilet.distanceKm !== undefined ? (
              <p className="tiny muted">{toilet.distanceKm.toFixed(2)}km away</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
