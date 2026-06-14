"use client";

import { Mail } from "lucide-react";
import { useActionState } from "react";

import {
  startDirectConversationAction,
  type StartDirectConversationActionState,
} from "@/features/messages/actions/start-direct-conversation-action";

const initialState: StartDirectConversationActionState = {
  success: false,
  message: "",
};

type Props = {
  username: string;
};

export default function StartDirectConversationButton({ username }: Props) {
  const [state, formAction, isPending] = useActionState(
    startDirectConversationAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="username" value={username} />
      <button
        type="submit"
        disabled={isPending}
        className="grid size-10 place-items-center rounded-full border border-neutral-600 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="メッセージを送る"
        title={state.message || "メッセージを送る"}
      >
        <Mail className="size-5" />
      </button>
    </form>
  );
}
