"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { UserProfileItem } from "@/features/user/types/user.types";
import {
  updateUserAction,
  type UpdateUserActionState,
} from "@/features/user/actions/update-user-action";
import {
  getUserBackgroundImageUrl,
  getUserImageUrl,
} from "@/lib/utils/default-user-images";

type Props = {
  user: UserProfileItem;
  formId: string;
  onSuccess?: () => void;
};

const initialState: UpdateUserActionState = {
  success: false,
  message: "",
};

export function UserEditForm({ user, formId, onSuccess }: Props) {
  // Server Action の戻り値を state に保持し、送信中・エラー表示・成功判定に使う。
  const [state, formAction, isPending] = useActionState(
    updateUserAction,
    initialState
  );

  // 実際の file input は隠して、カメラボタンからクリックさせる。
  const imageInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

  // 画像を選択した直後に、保存前でも画面上で確認できるようにする。
  const [imagePreview, setImagePreview] = useState(
    getUserImageUrl(user.image)
  );

  const [backgroundImagePreview, setBackgroundImagePreview] = useState(
    getUserBackgroundImageUrl(user.backgroundImage)
  );
  const lastHandledSubmittedAtRef = useRef<number | undefined>(undefined);

  // 成功した送信結果ごとに一度だけ親へ通知する。現在は編集ダイアログを閉じる用途。
  useEffect(() => {
    if (!state.success || !state.submittedAt) return;
    if (lastHandledSubmittedAtRef.current === state.submittedAt) return;

    lastHandledSubmittedAtRef.current = state.submittedAt;
    onSuccess?.();
  }, [onSuccess, state.submittedAt, state.success]);

  return (
    // id はダイアログヘッダーの保存ボタンの form 属性と揃える。
    <form id={formId} action={formAction} className="flex flex-col">
      {/* Server Action 側で編集対象ユーザーと権限を確認するために送る。 */}
      <input type="hidden" name="userId" value={user.id} />

      {/* ヘッダー画像のプレビューとアップロード操作。 */}
      <div className="relative h-[120px] bg-neutral-900 sm:h-[200px]">
        <Image
          src={backgroundImagePreview}
          alt=""
          fill
          className="object-cover"
        />

        <input
          ref={backgroundImageInputRef}
          type="file"
          name="backgroundImage"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          disabled={isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setBackgroundImagePreview(URL.createObjectURL(file));
          }}
        />

        <button
          type="button"
          disabled={isPending}
          onClick={() => backgroundImageInputRef.current?.click()}
          className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/60 transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="ヘッダー画像を変更"
        >
          <Camera className="size-5" />
        </button>
      </div>

      <div className="px-4">
        {/* プロフィール画像のプレビューとアップロード操作。ヘッダー画像に少し重ねて表示する。 */}
        <div className="relative h-16">
          <div className="absolute -top-10 left-0 rounded-full bg-black p-1">
            <div className="relative size-[88px] overflow-hidden rounded-full bg-neutral-800">
              <Image
                src={imagePreview}
                alt=""
                fill
                className="object-cover"
              />

              <input
                ref={imageInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                disabled={isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setImagePreview(URL.createObjectURL(file));
                }}
              />

              <button
                type="button"
                disabled={isPending}
                onClick={() => imageInputRef.current?.click()}
                className="absolute inset-0 grid place-items-center bg-black/45 transition hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="プロフィール画像を変更"
              >
                <Camera className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-6">
          {/* Server Action から返された成功・失敗メッセージ。 */}
          {state.message ? (
            <p
              className={
                state.success
                  ? "text-sm text-green-500"
                  : "text-sm text-red-500"
              }
            >
              {state.message}
            </p>
          ) : null}

          {/* テキスト入力欄。バリデーションエラー時は入力値を state.values から復元する。 */}
          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">名前</span>
            <input
              name="name"
              defaultValue={state.values?.name ?? user.name ?? ""}
              maxLength={50}
              disabled={isPending}
              className="mt-1 w-full bg-transparent text-[17px] outline-none disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.name ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">ユーザー名</span>
            <input
              name="username"
              defaultValue={state.values?.username ?? user.username ?? ""}
              maxLength={30}
              autoComplete="username"
              disabled={isPending}
              className="mt-1 w-full bg-transparent text-[17px] outline-none disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.username ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.username[0]}
            </p>
          ) : null}

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">自己紹介</span>
            <textarea
              name="bio"
              defaultValue={state.values?.bio ?? user.bio ?? ""}
              maxLength={160}
              rows={3}
              disabled={isPending}
              className="mt-1 w-full resize-none bg-transparent text-[17px] outline-none disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.bio ? (
            <p className="text-sm text-red-500">{state.fieldErrors.bio[0]}</p>
          ) : null}

          {state.fieldErrors?.image ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.image[0]}
            </p>
          ) : null}

          {state.fieldErrors?.backgroundImage ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.backgroundImage[0]}
            </p>
          ) : null}

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">
              現在のパスワード
            </span>
            <input
              type="password"
              name="currentPassword"
              maxLength={100}
              autoComplete="current-password"
              placeholder="パスワード変更時のみ入力"
              disabled={isPending}
              className="mt-1 w-full bg-transparent text-[17px] outline-none placeholder:text-white/30 disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.currentPassword ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.currentPassword[0]}
            </p>
          ) : null}

          <label className="block rounded border border-white/20 px-3 py-2 focus-within:border-sky-500">
            <span className="block text-xs text-neutral-500">
              新しいパスワード
            </span>
            <input
              type="password"
              name="newPassword"
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              placeholder="変更する場合のみ入力"
              disabled={isPending}
              className="mt-1 w-full bg-transparent text-[17px] outline-none placeholder:text-white/30 disabled:opacity-60"
            />
          </label>

          {state.fieldErrors?.newPassword ? (
            <p className="text-sm text-red-500">
              {state.fieldErrors.newPassword[0]}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
