export type User = {
  id: string;
  handle: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
};

export type Toilet = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  accessibility: string;
  genderNeutral: boolean;
  createdAt: string;
};

export type PoopPost = {
  id: string;
  authorId: string;
  toiletId?: string;
  originalImageUrl: string;
  cartoonImageUrl: string;
  caption?: string;
  lat: number;
  lng: number;
  createdAt: string;
};

export type PostLike = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
};

export type ToiletRating = {
  id: string;
  toiletId: string;
  userId: string;
  cleanliness: number;
  privacy: number;
  paper: number;
  vibe: number;
  overall: number;
  createdAt: string;
};

export type Database = {
  users: User[];
  toilets: Toilet[];
  posts: PoopPost[];
  likes: PostLike[];
  comments: PostComment[];
  ratings: ToiletRating[];
};

export type SafeUser = Omit<User, "passwordHash" | "email"> & {
  emailMasked: string;
};

export type PostWithMeta = PoopPost & {
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  authorHandle: string;
  authorAvatarUrl?: string;
  toiletName?: string;
  distanceKm?: number;
};

export type ToiletWithMeta = Toilet & {
  ratingAverage: number;
  ratingCount: number;
  postCount: number;
  topPostId?: string;
  topPoopOwnerId?: string;
  topPoopOwnerHandle?: string;
  distanceKm?: number;
};
