import UserMediaPageView from "@/app/(protected)/users/[username]/media/_components/UserMediaPageView";
import { getUserPostsPage } from "@/features/post/server/get-user-posts-page";
import { getUserByUsername } from "@/features/user/server/get-user";

type Props = {
  params: {
    username: string;
  };
};

export default async function UserMediaPage({
  params
}: Props) {
  const { username } = params;

  const user = await getUserByUsername(username);

  const [ feedPage ] = await Promise.all([
    getUserPostsPage({
      where: { 
        userId: user?.id,
        images: { some: {}}
       },
      limit: 20
    }),
  ]);

  return (
    <UserMediaPageView
      username={username}
      feedPage={feedPage}
    />
  );
}