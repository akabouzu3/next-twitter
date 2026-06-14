"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";

import {
  startDirectConversationAction,
  type StartDirectConversationActionState,
} from "@/features/messages/actions/start-direct-conversation-action";

const initialState: StartDirectConversationActionState = {
  success: false,
  message: "",
};

export default function StartDirectConversationForm() {
  const [state, formAction, isPending] = useActionState(
    startDirectConversationAction,
    initialState,
  );

  return (
    <form action={formAction} className="border-b border-white/10 px-4 py-4">
      <div className="flex items-start gap-3">
        <label className="min-w-0 flex-1">
          <span className="sr-only">送信先のユーザー名</span>
          <input
            name="username"
            defaultValue={state.values?.username ?? ""}
            placeholder="@username"
            autoComplete="off"
            disabled={isPending}
            className="h-11 w-full rounded-full border border-white/15 bg-transparent px-4 text-[15px] outline-none transition placeholder:text-white/35 focus:border-sky-500 disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="メッセージを開始"
        >
          <Send className="size-5" />
        </button>
      </div>

      {state.fieldErrors?.username ? (
        <p className="mt-2 text-sm text-red-400">
          {state.fieldErrors.username[0]}
        </p>
      ) : state.message ? (
        <p className="mt-2 text-sm text-red-400">{state.message}</p>
      ) : null}
    </form>
  );
}
