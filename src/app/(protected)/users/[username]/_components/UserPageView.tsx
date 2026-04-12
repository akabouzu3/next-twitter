import { UserPostItem } from "@/features/post/server/get-user-posts";
import { UserProfile } from "@/features/user/server/get-user";
import { CurrentUser } from "@/lib/auth/current-user";

type Props = {
  currentUser: CurrentUser;
  user: UserProfile | null;
  posts: UserPostItem[];
};

export default function UserPageView({
  currentUser,
  user,
  posts
}: Props) {
  return (
    <div>UserPageView</div>
  )
}
