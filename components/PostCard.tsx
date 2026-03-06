"use client";

import { FormEvent, useEffect, useState } from "react";

import { jsonFetch } from "@/lib/client";
import type { PostWithMeta } from "@/types";

type Comment = {
  id: string;
  text: string;
  authorHandle: string;
  createdAt: string;
};

export function PostCard({
  post,
  onRefresh,
}: {
  post: PostWithMeta;
  onRefresh?: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showComments) return;
    jsonFetch<{ comments: Comment[] }>(`/api/posts/${post.id}/comments`)
      .then((data) => setComments(data.comments))
      .catch(() => undefined);
  }, [post.id, showComments]);

  async function toggleLike(): Promise<void> {
    setError(null);
    try {
      await jsonFetch<{ liked: boolean }>(`/api/posts/${post.id}/like`, {
        method: "POST",
      });
      onRefresh?.();
    } catch (likeError) {
      setError(likeError instanceof Error ? likeError.message : "Login to like posts.");
    }
  }

  async function submitComment(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!text.trim()) return;
    setError(null);
    try {
      await jsonFetch<{ comment: Comment }>(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setText("");
      const data = await jsonFetch<{ comments: Comment[] }>(
        `/api/posts/${post.id}/comments`,
      );
      setComments(data.comments);
      onRefresh?.();
    } catch (commentError) {
      setError(
        commentError instanceof Error
          ? commentError.message
          : "Login to comment on posts.",
      );
    }
  }

  return (
    <article className="post-card">
      <header className="post-head">
        <img
          src={post.authorAvatarUrl}
          alt={post.authorHandle}
          className="avatar"
        />
        <div>
          <p className="post-author">@{post.authorHandle}</p>
          <p className="muted tiny">
            {post.toiletName ?? "Unpinned toilet"}
            {post.distanceKm !== undefined
              ? ` · ${post.distanceKm.toFixed(2)}km away`
              : ""}
          </p>
        </div>
      </header>
      <img src={post.cartoonImageUrl} alt="Poop cartoon post" className="post-image" />
      {post.caption ? <p className="post-caption">{post.caption}</p> : null}
      <div className="post-actions">
        <button className="ghost-btn" type="button" onClick={toggleLike}>
          {post.likedByMe ? "💖 Liked" : "🤎 Like"} ({post.likeCount})
        </button>
        <button
          className="ghost-btn"
          type="button"
          onClick={() => setShowComments((value) => !value)}
        >
          💬 Comments ({post.commentCount})
        </button>
      </div>

      {showComments ? (
        <section className="comment-wrap">
          {comments.map((comment) => (
            <p key={comment.id} className="comment-line">
              <strong>@{comment.authorHandle}</strong> {comment.text}
            </p>
          ))}
          <form onSubmit={submitComment} className="comment-form">
            <input
              className="input"
              placeholder="Drop a comment"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button className="primary-btn" type="submit">
              Send
            </button>
          </form>
        </section>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}
    </article>
  );
}
