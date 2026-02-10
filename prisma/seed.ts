import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ---------------------------------
  // clean up（開発用）
  // ---------------------------------
  await prisma.postLike.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------
  // users
  // ---------------------------------
  const password = await bcrypt.hash('password123', 10);
  const generateRandomImageUrl = () => `https://picsum.photos/seed/${Math.random()}/600/400`;

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin',
      password,
      role: UserRole.ADMIN,
      iconImage: generateRandomImageUrl(),
      backgroundImage: generateRandomImageUrl(),
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      username: 'user1',
      name: 'User One',
      password,
      iconImage: generateRandomImageUrl(),
      backgroundImage: generateRandomImageUrl(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      username: 'user2',
      name: 'User Two',
      password,
      iconImage: generateRandomImageUrl(),
      backgroundImage: generateRandomImageUrl(),
    },
  });

  // ---------------------------------
  // posts + images
  // --------------------------------- 
  const post1 = await prisma.post.create({
    data: {
      content: 'Hello, this is my first post!',
      userId: user1.id,
      images: {
        create: [
          { url: generateRandomImageUrl() },
          { url: generateRandomImageUrl() },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: 'Second post from user2',
      userId: user2.id,
      images: {
        create: [
          { url: generateRandomImageUrl() },
          { url: generateRandomImageUrl() },
        ],
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      content: 'Third post from admin',
      userId: admin.id,
      images: {
        create: [
          { url: generateRandomImageUrl() },
        ],
      },
    },
  });

  // ---------------------------------
  // follows
  // ---------------------------------
  await prisma.follow.createMany({
    data: [
      {
        followerId: user1.id,
        followingId: user2.id,
      },
      {
        followerId: user2.id,
        followingId: user1.id,
      },
      {
        followerId: user1.id,
        followingId: admin.id,
      },
    ],
  });

  // ---------------------------------
  // likes
  // ---------------------------------
  await prisma.postLike.createMany({
    data: [
      {
        userId: user1.id,
        postId: post3.id,
      },
      {
        userId: user2.id,
        postId: post1.id,
      },
      {
        userId: admin.id,
        postId: post2.id,
      },
    ],
  });

  console.log('🌱 Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
