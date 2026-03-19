import { generateRandomImageUrl } from "@/lib/utils/image-url";
export const mockPosts = [
  {
    id: "1",
    author: {
      name: "Hiroshi Wayama",
      username: "mushoku_swe",
      avatarUrl: generateRandomImageUrl(),
      verified: true,
    },
    content:
      "コーディングでGeminiCLIもCodexCLIも利用して思うが、やはりプログラマやSEとしての仕事は今後も減少していくだろうなという感想。また、データサイエンティストや機械学習エンジニアとしても需要は減るだろうなと印象。",
    createdAt: "22時間",
    stats: {
      replies: 2,
      reposts: 46,
      likes: 319,
      views: "5.5万",
    },
  },
  {
    id: "2",
    author: {
      name: "無印良品",
      username: "muji_net",
      avatarUrl: generateRandomImageUrl(),
      verified: true,
    },
    content:
      "【変わる暮らしに、変わらず寄りそう。無印良品】\n\n手軽に組み立てられる木製シェルフ。どんな部屋にもなじみやすく、使用用途に応じて高さを調整できます。",
    createdAt: "広告",
    stats: {
      replies: 0,
      reposts: 0,
      likes: 0,
      views: "1.2万",
    },
    imageUrl: generateRandomImageUrl(),
  },
  {
    id: "3",
    author: {
      name: "無印良品",
      username: "muji_net",
      avatarUrl: generateRandomImageUrl(),
      verified: true,
    },
    content:
      "【変わる暮らしに、変わらず寄りそう。無印良品】\n\n手軽に組み立てられる木製シェルフ。どんな部屋にもなじみやすく、使用用途に応じて高さを調整できます。",
    createdAt: "広告",
    stats: {
      replies: 0,
      reposts: 0,
      likes: 0,
      views: "1.2万",
    },
    imageUrl: generateRandomImageUrl(),
  },
  {
    id: "4",
    author: {
      name: "無印良品",
      username: "muji_net",
      avatarUrl: generateRandomImageUrl(),
      verified: true,
    },
    content:
      "【変わる暮らしに、変わらず寄りそう。無印良品】\n\n手軽に組み立てられる木製シェルフ。どんな部屋にもなじみやすく、使用用途に応じて高さを調整できます。",
    createdAt: "広告",
    stats: {
      replies: 0,
      reposts: 0,
      likes: 0,
      views: "1.2万",
    },
    imageUrl: generateRandomImageUrl(),
  },
  {
    id: "5",
    author: {
      name: "無印良品",
      username: "muji_net",
      avatarUrl:generateRandomImageUrl(),
      verified: true,
    },
    content:
      "【変わる暮らしに、変わらず寄りそう。無印良品】\n\n手軽に組み立てられる木製シェルフ。どんな部屋にもなじみやすく、使用用途に応じて高さを調整できます。",
    createdAt: "広告",
    stats: {
      replies: 0,
      reposts: 0,
      likes: 0,
      views: "1.2万",
    },
    imageUrl:generateRandomImageUrl(),
  },
];