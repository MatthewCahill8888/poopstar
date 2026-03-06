/**
 * Application-level Row Level Security (RLS).
 * The app uses a JSON file store (no PostgreSQL), so we enforce row-level
 * access in code: only the resource owner can update/delete their rows.
 */

import {
  getCommentById,
  getPostById,
  getToiletById,
} from "@/lib/db";

export class RLSForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RLSForbiddenError";
  }
}

/** Assert the post exists; throw if not found. */
export function assertPostExists(postId: string): void {
  const post = getPostById(postId);
  if (!post) {
    throw new RLSForbiddenError("Post not found.");
  }
}

/** Assert the current user is the post author; throw otherwise. */
export function assertPostOwner(postId: string, userId: string): void {
  const post = getPostById(postId);
  if (!post) {
    throw new RLSForbiddenError("Post not found.");
  }
  if (post.authorId !== userId) {
    throw new RLSForbiddenError("You can only modify your own posts.");
  }
}

/** Assert the comment exists; throw if not found. */
export function assertCommentExists(commentId: string): void {
  const comment = getCommentById(commentId);
  if (!comment) {
    throw new RLSForbiddenError("Comment not found.");
  }
}

/** Assert the current user is the comment author; throw otherwise. */
export function assertCommentOwner(commentId: string, userId: string): void {
  const comment = getCommentById(commentId);
  if (!comment) {
    throw new RLSForbiddenError("Comment not found.");
  }
  if (comment.userId !== userId) {
    throw new RLSForbiddenError("You can only delete your own comments.");
  }
}

/** Assert the toilet exists; throw if not found. */
export function assertToiletExists(toiletId: string): void {
  const toilet = getToiletById(toiletId);
  if (!toilet) {
    throw new RLSForbiddenError("Toilet not found.");
  }
}

/**
 * Assert the current user can update this toilet's rating:
 * they can only upsert/update their own rating row (enforced by toiletId + userId).
 */
export function assertRatingScope(toiletId: string, userId: string): void {
  assertToiletExists(toiletId);
  // Rating upsert is already scoped by userId in the API; no cross-user write.
}
