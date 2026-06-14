"use client";

import { Send } from "lucide-react";
import { useActionState, useCallback, useEffect, useRef } from "react";

import {
  sendDirectMessageAction,
  type SendDirectMessageActionState,
} from "@/features/messages/actions/send-direct-message-action";

const initialState: SendDirectMessageActionState = {
  success: false,
  message: "",
};

type Props = {
  conversationId: string;
};

/**
 * DM詳細画面の送信フォーム。
 *
 * Server Action に FormData を渡してメッセージを作成し、
 * バリデーションエラーが返った場合は入力内容とエラー表示を保持する。
 */
export default function DirectMessageForm({ conversationId }: Props) {
  // useActionState は Server Action の戻り値を state として保持し、送信中フラグも返す。
  const [state, formAction, isPending] = useActionState(
    sendDirectMessageAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  // textarea の DOM に直接触って、入力内容に合わせた高さ調整を行う。
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 同じ送信成功レスポンスで form.reset() を二重実行しないための処理済みメモ。
  const lastHandledSubmittedAtRef = useRef<number | undefined>(undefined);
  const resizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    // 一度 auto に戻してから scrollHeight を読むと、削除時にも高さが縮む。
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (!state.success || !state.submittedAt) return;
    // React の再レンダー等で同じ submittedAt を見ても、同じ成功は一度だけ扱う。
    if (lastHandledSubmittedAtRef.current === state.submittedAt) return;

    // 送信成功ごとに一度だけフォームを空にする。失敗時は入力を残して再編集できるようにする。
    lastHandledSubmittedAtRef.current = state.submittedAt;
    formRef.current?.reset();
    if (textareaRef.current) {
      // reset() で本文が空になった後、textarea の高さも1行分へ戻す。
      resizeTextarea(textareaRef.current);
    }
  }, [resizeTextarea, state.submittedAt, state.success]);

  useEffect(() => {
    if (textareaRef.current) {
      // 送信失敗時に defaultValue が戻った場合も、表示される本文量に高さを合わせる。
      resizeTextarea(textareaRef.current);
    }
  }, [resizeTextarea, state.values?.content]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-t border-white/10 bg-black px-4 py-3"
    >
      {/* Server Action 側で送信先の会話を検証できるよう、本文と一緒に会話IDを送る。 */}
      <input type="hidden" name="conversationId" value={conversationId} />

      <div className="flex items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="sr-only">メッセージ本文</span>
          <textarea
            ref={textareaRef}
            name="content"
            rows={1}
            maxLength={1000}
            placeholder="メッセージを作成"
            // 送信失敗時は Server Action から戻した値を初期値にして、入力内容を消さない。
            defaultValue={state.values?.content ?? ""}
            disabled={isPending}
            // 入力のたびに scrollHeight へ合わせ、複数行メッセージでフォームを伸ばす。
            onInput={(event) => resizeTextarea(event.currentTarget)}
            className="max-h-32 min-h-11 w-full resize-none overflow-y-auto rounded-3xl border border-white/15 bg-transparent px-4 py-2.5 text-[15px] leading-5 outline-none transition placeholder:text-white/35 focus:border-sky-500 disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="mb-1 grid size-9 shrink-0 place-items-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="メッセージを送信"
        >
          <Send className="size-4" />
        </button>
      </div>

      {state.fieldErrors?.content ? (
        <p className="mt-2 text-sm text-red-400">
          {state.fieldErrors.content[0]}
        </p>
      ) : state.fieldErrors?.conversationId ? (
        <p className="mt-2 text-sm text-red-400">
          {state.fieldErrors.conversationId[0]}
        </p>
      ) : !state.success && state.message ? (
        <p className="mt-2 text-sm text-red-400">{state.message}</p>
      ) : null}
    </form>
  );
}
