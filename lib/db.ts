import fs from "node:fs";
import path from "node:path";

import { hashSync } from "bcryptjs";

import { DB_PATH } from "@/lib/constants";
import { distanceKm } from "@/lib/geo";

const IS_VERCEL = process.env.VERCEL === "1";
let memoryDb: Database | null = null;

function getMemoryDb(): Database {
  if (!memoryDb) {
    memoryDb = createSeedDatabase();
  }
  return memoryDb;
}
import type {
  Database,
  PoopPost,
  PostComment,
  PostLike,
  PostWithMeta,
  SafeUser,
  Toilet,
  ToiletRating,
  ToiletWithMeta,
  User,
} from "@/types";

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function ensureDbFile(): void {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seeded = createSeedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2), "utf8");
  }
}

function createSeedDatabase(): Database {
  const t = nowIso();
  const user1Id = "user_demo_alex";
  const user2Id = "user_demo_zoe";
  const toilet1Id = "toilet_union";
  const toilet2Id = "toilet_cafe";
  const post1Id = "post_demo_1";
  const post2Id = "post_demo_2";

  return {
    users: [
      {
        id: user1Id,
        handle: "alexplop",
        email: "alex@example.com",
        passwordHash: hashSync("password123", 10),
        avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Alex",
        bio: "Ranking toilets one poop at a time.",
        createdAt: t,
      },
      {
        id: user2Id,
        handle: "zoezoom",
        email: "zoe@example.com",
        passwordHash: hashSync("password123", 10),
        avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Zoe",
        bio: "Nearby feed addict.",
        createdAt: t,
      },
    ],
    toilets: [
      {
        id: toilet1Id,
        name: "Union Station Restroom",
        address: "123 Main St",
        lat: 51.5079,
        lng: -0.0877,
        openingHours: "24/7",
        accessibility: "Wheelchair accessible",
        genderNeutral: true,
        createdAt: t,
      },
      {
        id: toilet2Id,
        name: "Bean Palace Cafe Toilet",
        address: "7 Market Ave",
        lat: 51.5112,
        lng: -0.0921,
        openingHours: "07:00 - 22:00",
        accessibility: "Step-free access",
        genderNeutral: false,
        createdAt: t,
      },
    ],
    posts: [
      {
        id: post1Id,
        authorId: user1Id,
        toiletId: toilet1Id,
        originalImageUrl: "https://placehold.co/600x600/fecaca/111111?text=Original+Poop",
        cartoonImageUrl: "/demo-cartoon-1.png",
        caption: "Morning masterpiece",
        lat: 51.5079,
        lng: -0.0877,
        createdAt: t,
      },
      {
        id: post2Id,
        authorId: user2Id,
        toiletId: toilet2Id,
        originalImageUrl: "https://placehold.co/600x600/fbcfe8/111111?text=Original+Poop",
        cartoonImageUrl: "/demo-cartoon-2.png",
        caption: "Cafe special drop",
        lat: 51.5112,
        lng: -0.0921,
        createdAt: t,
      },
    ],
    likes: [
      { id: id("like"), postId: post1Id, userId: user2Id, createdAt: t },
      { id: id("like"), postId: post1Id, userId: user1Id, createdAt: t },
      { id: id("like"), postId: post2Id, userId: user1Id, createdAt: t },
    ],
    comments: [
      {
        id: id("comment"),
        postId: post1Id,
        userId: user2Id,
        text: "Legendary flush energy.",
        createdAt: t,
      },
      {
        id: id("comment"),
        postId: post2Id,
        userId: user1Id,
        text: "Rate this toilet 5 stars for sure.",
        createdAt: t,
      },
    ],
    ratings: [
      {
        id: id("rating"),
        toiletId: toilet1Id,
        userId: user1Id,
        cleanliness: 5,
        privacy: 4,
        paper: 4,
        vibe: 5,
        overall: 4.5,
        createdAt: t,
      },
      {
        id: id("rating"),
        toiletId: toilet2Id,
        userId: user2Id,
        cleanliness: 4,
        privacy: 3,
        paper: 4,
        vibe: 4,
        overall: 3.8,
        createdAt: t,
      },
    ],
  };
}

const DEMO_CARTOON_1 = "/demo-cartoon-1.png";
const DEMO_CARTOON_2 = "/demo-cartoon-2.png";
const OLD_PLACEHOLDER_1 = "https://placehold.co/600x600/fcd34d/111111?text=Brainrot+Cartoon";
const OLD_PLACEHOLDER_2 = "https://placehold.co/600x600/fde68a/111111?text=Cartoon+Drop";

/** Migrate demo posts from placeholder URLs to real demo images. Returns true if any change was made. */
function migrateDemoPostImages(db: Database): boolean {
  let changed = false;
  for (const post of db.posts) {
    if (post.cartoonImageUrl === OLD_PLACEHOLDER_1) {
      post.cartoonImageUrl = DEMO_CARTOON_1;
      changed = true;
    }
    if (post.cartoonImageUrl === OLD_PLACEHOLDER_2) {
      post.cartoonImageUrl = DEMO_CARTOON_2;
      changed = true;
    }
  }
  return changed;
}

export function readDb(): Database {
  if (IS_VERCEL) {
    return getMemoryDb();
  }
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(raw) as Database;
  if (migrateDemoPostImages(db)) {
    writeDb(db);
  }
  return db;
}

function writeDb(db: Database): void {
  if (IS_VERCEL) return; // no-op; in-memory only on Vercel
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function updateDb<T>(fn: (db: Database) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

function maskEmail(email: string): string {
  const [left, right] = email.split("@");
  if (!right) return "***";
  const visible = left.slice(0, 2);
  return `${visible}***@${right}`;
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
    emailMasked: maskEmail(user.email),
  };
}

function getToiletMeta(db: Database, toilet: Toilet): ToiletWithMeta {
  const toiletRatings = db.ratings.filter((rating) => rating.toiletId === toilet.id);
  const toiletPosts = db.posts.filter((post) => post.toiletId === toilet.id);
  const postLikeCounts = toiletPosts.map((post) => ({
    postId: post.id,
    count: db.likes.filter((like) => like.postId === post.id).length,
    createdAt: post.createdAt,
    authorId: post.authorId,
  }));
  postLikeCounts.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const top = postLikeCounts[0];
  const ownerUser = top ? db.users.find((u) => u.id === top.authorId) : undefined;
  const average =
    toiletRatings.length > 0
      ? toiletRatings.reduce((acc, item) => acc + item.overall, 0) / toiletRatings.length
      : 0;

  return {
    ...toilet,
    ratingAverage: Number(average.toFixed(2)),
    ratingCount: toiletRatings.length,
    postCount: toiletPosts.length,
    topPostId: top?.postId,
    topPoopOwnerId: top?.authorId,
    topPoopOwnerHandle: ownerUser?.handle,
  };
}

export function getToiletsWithMeta(
  lat?: number,
  lng?: number,
): ToiletWithMeta[] {
  const db = readDb();
  return db.toilets
    .map((toilet) => {
      const base = getToiletMeta(db, toilet);
      if (lat !== undefined && lng !== undefined) {
        return { ...base, distanceKm: distanceKm(lat, lng, toilet.lat, toilet.lng) };
      }
      return base;
    })
    .sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function getToiletById(idValue: string): ToiletWithMeta | undefined {
  const db = readDb();
  const toilet = db.toilets.find((item) => item.id === idValue);
  if (!toilet) {
    return undefined;
  }
  return getToiletMeta(db, toilet);
}

export function getPostById(postId: string): PoopPost | undefined {
  const db = readDb();
  return db.posts.find((p) => p.id === postId);
}

export function getCommentById(commentId: string): PostComment | undefined {
  const db = readDb();
  return db.comments.find((c) => c.id === commentId);
}

export function getPostsWithMeta(
  viewerUserId?: string,
  lat?: number,
  lng?: number,
): PostWithMeta[] {
  const db = readDb();
  return db.posts
    .map((post) => {
      const author = db.users.find((u) => u.id === post.authorId);
      const toilet = post.toiletId
        ? db.toilets.find((item) => item.id === post.toiletId)
        : undefined;
      const likes = db.likes.filter((item) => item.postId === post.id);
      const comments = db.comments.filter((item) => item.postId === post.id);
      const distance =
        lat !== undefined && lng !== undefined
          ? distanceKm(lat, lng, post.lat, post.lng)
          : undefined;
      return {
        ...post,
        likeCount: likes.length,
        commentCount: comments.length,
        likedByMe: viewerUserId
          ? likes.some((like) => like.userId === viewerUserId)
          : false,
        authorHandle: author?.handle ?? "unknown",
        authorAvatarUrl: author?.avatarUrl,
        toiletName: toilet?.name,
        distanceKm: distance,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createUser(input: {
  handle: string;
  email: string;
  passwordHash: string;
}): User {
  return updateDb((db) => {
    const exists = db.users.some(
      (user) =>
        user.email.toLowerCase() === input.email.toLowerCase() ||
        user.handle.toLowerCase() === input.handle.toLowerCase(),
    );
    if (exists) {
      throw new Error("A user with this email or handle already exists.");
    }
    const user: User = {
      id: id("user"),
      handle: input.handle,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: nowIso(),
      avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
        input.handle,
      )}`,
      bio: "New to Poopstar.",
    };
    db.users.push(user);
    return user;
  });
}

export function findUserByEmail(email: string): User | undefined {
  const db = readDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(userId: string): User | undefined {
  const db = readDb();
  return db.users.find((user) => user.id === userId);
}

export function findUserByHandle(handle: string): User | undefined {
  const db = readDb();
  return db.users.find((user) => user.handle.toLowerCase() === handle.toLowerCase());
}

export function createPost(input: {
  authorId: string;
  toiletId?: string;
  caption?: string;
  originalImageUrl: string;
  cartoonImageUrl: string;
  lat: number;
  lng: number;
}): PoopPost {
  return updateDb((db) => {
    const post: PoopPost = {
      id: id("post"),
      authorId: input.authorId,
      toiletId: input.toiletId,
      caption: input.caption,
      originalImageUrl: input.originalImageUrl,
      cartoonImageUrl: input.cartoonImageUrl,
      lat: input.lat,
      lng: input.lng,
      createdAt: nowIso(),
    };
    db.posts.push(post);
    return post;
  });
}

export function toggleLike(postId: string, userId: string): { liked: boolean } {
  return updateDb((db) => {
    const existing = db.likes.find(
      (like) => like.postId === postId && like.userId === userId,
    );
    if (existing) {
      db.likes = db.likes.filter((like) => like.id !== existing.id);
      return { liked: false };
    }
    db.likes.push({
      id: id("like"),
      postId,
      userId,
      createdAt: nowIso(),
    });
    return { liked: true };
  });
}

export function getComments(postId: string): (PostComment & {
  authorHandle: string;
  authorAvatarUrl?: string;
})[] {
  const db = readDb();
  return db.comments
    .filter((comment) => comment.postId === postId)
    .map((comment) => {
      const author = db.users.find((user) => user.id === comment.userId);
      return {
        ...comment,
        authorHandle: author?.handle ?? "unknown",
        authorAvatarUrl: author?.avatarUrl,
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addComment(postId: string, userId: string, text: string): PostComment {
  return updateDb((db) => {
    const postExists = db.posts.some((p) => p.id === postId);
    if (!postExists) {
      throw new Error("Post not found.");
    }
    const comment: PostComment = {
      id: id("comment"),
      postId,
      userId,
      text,
      createdAt: nowIso(),
    };
    db.comments.push(comment);
    return comment;
  });
}

/** RLS: call only after asserting current user is post author. */
export function deletePost(postId: string): void {
  updateDb((db) => {
    db.posts = db.posts.filter((p) => p.id !== postId);
    db.likes = db.likes.filter((l) => l.postId !== postId);
    db.comments = db.comments.filter((c) => c.postId !== postId);
  });
}

/** RLS: call only after asserting current user is comment author. */
export function deleteComment(commentId: string): void {
  updateDb((db) => {
    db.comments = db.comments.filter((c) => c.id !== commentId);
  });
}

export function upsertToiletRating(
  input: Omit<ToiletRating, "id" | "createdAt">,
): ToiletRating {
  return updateDb((db) => {
    const existing = db.ratings.find(
      (rating) => rating.toiletId === input.toiletId && rating.userId === input.userId,
    );
    if (existing) {
      existing.cleanliness = input.cleanliness;
      existing.privacy = input.privacy;
      existing.paper = input.paper;
      existing.vibe = input.vibe;
      existing.overall = input.overall;
      existing.createdAt = nowIso();
      return existing;
    }
    const created: ToiletRating = {
      id: id("rating"),
      toiletId: input.toiletId,
      userId: input.userId,
      cleanliness: input.cleanliness,
      privacy: input.privacy,
      paper: input.paper,
      vibe: input.vibe,
      overall: input.overall,
      createdAt: nowIso(),
    };
    db.ratings.push(created);
    return created;
  });
}

export function getRatingsForToilet(toiletId: string): ToiletRating[] {
  const db = readDb();
  return db.ratings.filter((rating) => rating.toiletId === toiletId);
}

export function getPostsForToilet(
  toiletId: string,
  viewerUserId?: string,
): PostWithMeta[] {
  return getPostsWithMeta(viewerUserId).filter((post) => post.toiletId === toiletId);
}

export function getProfileByHandle(handle: string): {
  user: SafeUser;
  posts: PostWithMeta[];
  ownedToilets: ToiletWithMeta[];
} | null {
  const db = readDb();
  const user = db.users.find((item) => item.handle.toLowerCase() === handle.toLowerCase());
  if (!user) {
    return null;
  }
  const safeUser = toSafeUser(user);
  const posts = getPostsWithMeta(user.id).filter((post) => post.authorId === user.id);
  const toilets = getToiletsWithMeta();
  const ownedToilets = toilets.filter((item) => item.topPoopOwnerId === user.id);
  return { user: safeUser, posts, ownedToilets };
}

export function getNearestToilet(lat: number, lng: number): Toilet | undefined {
  const db = readDb();
  return db.toilets
    .map((toilet) => ({ toilet, d: distanceKm(lat, lng, toilet.lat, toilet.lng) }))
    .sort((a, b) => a.d - b.d)[0]?.toilet;
}

export function toRadiusPosts(
  posts: PostWithMeta[],
  radiusKm: number,
): PostWithMeta[] {
  return posts.filter((post) =>
    post.distanceKm !== undefined ? post.distanceKm <= radiusKm : true,
  );
}
