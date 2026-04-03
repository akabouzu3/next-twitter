import "server-only";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma/prisma";

type CreatePostInput = {
  userId: string;
  content: string;
  images: File[];
};

export async function createPost({
  userId,
  content,
  images,
}: CreatePostInput) {
  const imageUrls: string[] = [];

  if (images.length > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");

    await mkdir(uploadDir, { recursive: true });
    console.log("uploadDir", uploadDir);

    for (const image of images) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension = getExtension(image);
      const fileName = `${randomUUID()}.${extension}`;
      const filePath = path.join(uploadDir, fileName);
      console.log("filePath", filePath);
      await writeFile(filePath, buffer);

      imageUrls.push(`/uploads/posts/${fileName}`);
    }
  }

  const post = await prisma.post.create({
    data: {
      userId,
      content,
      images: {
        create: imageUrls.map((imageUrl, index) => ({
          url: imageUrl,
          sortOrder: index,
        })),
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return post;
}

function getExtension(file: File): string {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "jpg";
  if (fileName.endsWith(".png")) return "png";
  if (fileName.endsWith(".webp")) return "webp";
  if (fileName.endsWith(".gif")) return "gif";

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}