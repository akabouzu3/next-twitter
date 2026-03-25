import { PrismaClient, UserRole, type User, type Post } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateRandomImageUrl } from "@/lib/utils/image-url";

const prisma = new PrismaClient();

/**
 * =========================================================
 * Seed settings
 * =========================================================
 *
 * ここを変えるだけで seed データ量を調整できる。
 */
const SEED_CONFIG = {
  /**
   * admin を除いた一般ユーザー数
   */
  USER_COUNT: 10,

  /**
   * 各ユーザーの投稿数
   */
  POSTS_PER_USER: 7,

  /**
   * 各ユーザーが行ういいね数
   */
  LIKES_PER_USER: 3,

  /**
   * 各一般ユーザーが admin 以外に追加でランダムフォローする人数
   */
  FOLLOW_RANDOM_COUNT: 2,

  /**
   * seed 用の共通パスワード
   */
  PASSWORD: "password123",

  /**
   * 1投稿あたりの最大画像枚数
   */
  MAX_IMAGES_PER_POST: 4,
} as const;

/**
 * =========================================================
 * Utility helpers
 * =========================================================
 */

/**
 * min 以上 max 以下の整数を返す
 */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列からランダムに1件取得する
 */
function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * 配列をシャッフルする
 *
 * sort(() => Math.random() - 0.5) ではなく
 * Fisher-Yates shuffle を使う。
 */
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 指定したキーで重複排除する
 */
function uniqueByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(getKey(item), item);
  }

  return [...map.values()];
}

/**
 * 画像を 0〜MAX_IMAGES_PER_POST 枚でランダム生成する
 */
function buildRandomImageCreateInput() {
  const imageCount = randomInt(0, SEED_CONFIG.MAX_IMAGES_PER_POST);

  return Array.from({ length: imageCount }, () => ({
    url: generateRandomImageUrl(),
  }));
}

/**
 * ダミー投稿本文を生成する
 */
function generatePostContent(params: {
  userName: string;
  postIndex: number;
}) {
  const { userName, postIndex } = params;

  const samples = [
    `${userName} の投稿 ${postIndex + 1}`,
    "今日はUIの調整を進めています",
    "Next.js 15 で実装中",
    "Prisma の seed を整備中",
    "レスポンシブ対応を確認しています",
    "画像レイアウトの表示確認をしています",
    "型設計を見直しています",
    "Auth.js の挙動を確認しています",
    "投稿一覧の見た目を調整中です",
    "開発メモを残しておきます",
  ];

  return `${pickRandom(samples)}\nby ${userName}`;
}

/**
 * =========================================================
 * Seed steps
 * =========================================================
 */

/**
 * 開発用 cleanup
 *
 * 外部キー制約の都合で子テーブルから削除する。
 */
async function cleanup() {
  await prisma.$transaction([
    prisma.postLike.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.postImage.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

/**
 * admin ユーザーを作成する
 */
async function createAdmin(passwordHash: string) {
  return prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      name: "管理者",
      passwordHash,
      role: UserRole.ADMIN,
      image: generateRandomImageUrl(),
      backgroundImage: generateRandomImageUrl(),
    },
  });
}

/**
 * 一般ユーザーをまとめて作成する
 */
async function createUsers(passwordHash: string, userCount: number) {
  return Promise.all(
    Array.from({ length: userCount }, (_, index) => {
      const no = index + 1;

      return prisma.user.create({
        data: {
          email: `user${no}@example.com`,
          username: `user${no}`,
          name: `User ${no}`,
          passwordHash,
          image: generateRandomImageUrl(),
          backgroundImage: generateRandomImageUrl(),
        },
      });
    })
  );
}

/**
 * 1ユーザー分の投稿を作成する
 *
 * 各投稿の画像枚数は 0〜MAX_IMAGES_PER_POST の範囲でランダム。
 */
async function createPostsForUser(user: User, postsPerUser: number) {
  const posts: Post[] = [];

  for (let index = 0; index < postsPerUser; index++) {
    const post = await prisma.post.create({
      data: {
        content: generatePostContent({
          userName: user.name ?? user.username,
          postIndex: index,
        }),
        userId: user.id,
        images: {
          create: buildRandomImageCreateInput(),
        },
      },
    });

    posts.push(post);
  }

  return posts;
}

/**
 * 全ユーザー分の投稿を作成する
 */
async function createAllPosts(users: User[], postsPerUser: number) {
  const createdPosts: Post[] = [];

  for (const user of users) {
    const posts = await createPostsForUser(user, postsPerUser);
    createdPosts.push(...posts);
  }

  return createdPosts;
}

/**
 * フォロー関係を作成する
 *
 * - admin は全一般ユーザーをフォロー
 * - 各一般ユーザーは admin をフォロー
 * - 各一般ユーザーは他の一般ユーザーをランダムフォロー
 */
async function createFollows(users: User[], admin: User) {
  const followData: Array<{
    followerId: string;
    followingId: string;
  }> = [];

  const generalUsers = users.filter((user) => user.id !== admin.id);

  // admin -> 全一般ユーザー
  for (const user of generalUsers) {
    followData.push({
      followerId: admin.id,
      followingId: user.id,
    });
  }

  // 一般ユーザー -> admin
  for (const user of generalUsers) {
    followData.push({
      followerId: user.id,
      followingId: admin.id,
    });
  }

  // 一般ユーザー同士のランダムフォロー
  for (const user of generalUsers) {
    const candidates = generalUsers.filter((target) => target.id !== user.id);
    const selected = shuffle(candidates).slice(
      0,
      Math.min(SEED_CONFIG.FOLLOW_RANDOM_COUNT, candidates.length)
    );

    for (const target of selected) {
      followData.push({
        followerId: user.id,
        followingId: target.id,
      });
    }
  }

  const uniqueFollowData = uniqueByKey(
    followData,
    (item) => `${item.followerId}:${item.followingId}`
  );

  await prisma.follow.createMany({
    data: uniqueFollowData,
    skipDuplicates: true,
  });
}

/**
 * いいねを作成する
 *
 * 各ユーザーは自分以外の投稿に対してランダムにいいねする。
 */
async function createLikes(users: User[], posts: Post[]) {
  const likeData: Array<{
    userId: string;
    postId: string;
  }> = [];

  for (const user of users) {
    const candidatePosts = posts.filter((post) => post.userId !== user.id);
    const selectedPosts = shuffle(candidatePosts).slice(
      0,
      Math.min(SEED_CONFIG.LIKES_PER_USER, candidatePosts.length)
    );

    for (const post of selectedPosts) {
      likeData.push({
        userId: user.id,
        postId: post.id,
      });
    }
  }

  const uniqueLikeData = uniqueByKey(
    likeData,
    (item) => `${item.userId}:${item.postId}`
  );

  await prisma.postLike.createMany({
    data: uniqueLikeData,
    skipDuplicates: true,
  });
}

/**
 * seed 結果の件数を表示する
 */
async function printSummary() {
  const [userCount, postCount, postImageCount, followCount, likeCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.postImage.count(),
      prisma.follow.count(),
      prisma.postLike.count(),
    ]);

  console.log("🌱 Seed data inserted successfully");
  console.log("=".repeat(40));
  console.log(`Users      : ${userCount}`);
  console.log(`Posts      : ${postCount}`);
  console.log(`PostImages : ${postImageCount}`);
  console.log(`Follows    : ${followCount}`);
  console.log(`Likes      : ${likeCount}`);
  console.log("=".repeat(40));
  console.log("Config");
  console.log(
    JSON.stringify(
      {
        USER_COUNT: SEED_CONFIG.USER_COUNT,
        POSTS_PER_USER: SEED_CONFIG.POSTS_PER_USER,
        LIKES_PER_USER: SEED_CONFIG.LIKES_PER_USER,
        FOLLOW_RANDOM_COUNT: SEED_CONFIG.FOLLOW_RANDOM_COUNT,
        MAX_IMAGES_PER_POST: SEED_CONFIG.MAX_IMAGES_PER_POST,
      },
      null,
      2
    )
  );
}

async function main() {
  await cleanup();

  const passwordHash = await bcrypt.hash(SEED_CONFIG.PASSWORD, 10);

  const admin = await createAdmin(passwordHash);
  const generalUsers = await createUsers(passwordHash, SEED_CONFIG.USER_COUNT);

  const allUsers = [admin, ...generalUsers];
  const allPosts = await createAllPosts(allUsers, SEED_CONFIG.POSTS_PER_USER);

  await createFollows(allUsers, admin);
  await createLikes(allUsers, allPosts);

  await printSummary();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });