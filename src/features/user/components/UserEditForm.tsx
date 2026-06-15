"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { UserProfileItem } from "@/features/user/types/user.types";
import {
  updateUserAction,
  type UpdateUserActionState,
} from "@/features/user/actions/update-user-action";
import {
  getUserBackgroundImageUrl,
  getUserImageUrl,
} from "@/lib/utils/default-user-images";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/upload/image-limits";
import { validateSelectedImageFiles } from "@/lib/upload/validate-selected-image-files";

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

  // preview state は <Image> の src として使う表示用。ref は解放対象の blob URL だけを覚える後始末用。
  // 既存画像URLやデフォルト画像URLは revoke してはいけないため、blob URL と分けて管理する。
  const imagePreviewObjectUrlRef = useRef<string | null>(null);
  const backgroundImagePreviewObjectUrlRef = useRef<string | null>(null);

  // 画像を選択した直後に、保存前でも画面上で確認できるようにする。
  // ここには既存画像URL・デフォルト画像URL・blob URL のいずれかが入る。
  const [imagePreview, setImagePreview] = useState(
    getUserImageUrl(user.image)
  );

  const [backgroundImagePreview, setBackgroundImagePreview] = useState(
    getUserBackgroundImageUrl(user.backgroundImage)
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(
    null
  );
  const [profileImageErrors, setProfileImageErrors] = useState<string[]>([]);
  const lastHandledSubmittedAtRef = useRef<number | undefined>(undefined);

  // 不正な画像を選んだときは、選択前のプロフィール画像へ戻す。
  const resetImagePreview = () => {
    if (imagePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(imagePreviewObjectUrlRef.current);
      imagePreviewObjectUrlRef.current = null;
    }

    setImagePreview(getUserImageUrl(user.image));
  };

  // 不正な背景画像を選んだときは、選択前の背景画像へ戻す。
  const resetBackgroundImagePreview = () => {
    if (backgroundImagePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(backgroundImagePreviewObjectUrlRef.current);
      backgroundImagePreviewObjectUrlRef.current = null;
    }

    setBackgroundImagePreview(getUserBackgroundImageUrl(user.backgroundImage));
  };

  // 新しいプレビューを作る前に古い blob URL を解放し、選択を繰り返したときのメモリリークを避ける。
  const setImagePreviewFile = (file: File) => {
    if (imagePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(imagePreviewObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    imagePreviewObjectUrlRef.current = previewUrl;
    setImagePreview(previewUrl);
  };

  // 背景画像もプロフィール画像と同じく、現在表示中の blob URL を1つだけ保持する。
  const setBackgroundImagePreviewFile = (file: File) => {
    if (backgroundImagePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(backgroundImagePreviewObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    backgroundImagePreviewObjectUrlRef.current = previewUrl;
    setBackgroundImagePreview(previewUrl);
  };

  // プロフィール画像と背景画像は同じフォームで送るため、個別サイズだけでなく合計サイズもまとめて検証する。
  const validateProfileImages = ({
    nextImageFile = imageFile,
    nextBackgroundImageFile = backgroundImageFile,
  }: {
    nextImageFile?: File | null;
    nextBackgroundImageFile?: File | null;
  }) => {
    return validateSelectedImageFiles(
      [nextImageFile, nextBackgroundImageFile].filter(
        (file): file is File => file !== null
      ),
      {
        maxCount: 2,
      }
    );
  };

  const handleBackgroundImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const errors = validateProfileImages({
      nextBackgroundImageFile: file,
    });

    setProfileImageErrors(errors);

    if (errors.length > 0) {
      setBackgroundImageFile(null);
      resetBackgroundImagePreview();
      // input.files に巨大ファイルを残すと submit 時に Vercel の 413 へ進むため、必ず空にする。
      event.currentTarget.value = "";
      return;
    }

    setBackgroundImageFile(file);
    setBackgroundImagePreviewFile(file);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const errors = validateProfileImages({
      nextImageFile: file,
    });

    setProfileImageErrors(errors);

    if (errors.length > 0) {
      setImageFile(null);
      resetImagePreview();
      // input.files に巨大ファイルを残すと submit 時に Vercel の 413 へ進むため、必ず空にする。
      event.currentTarget.value = "";
      return;
    }

    setImageFile(file);
    setImagePreviewFile(file);
  };

  // 成功した送信結果ごとに一度だけ親へ通知する。現在は編集ダイアログを閉じる用途。
  useEffect(() => {
    if (!state.success || !state.submittedAt) return;
    if (lastHandledSubmittedAtRef.current === state.submittedAt) return;

    lastHandledSubmittedAtRef.current = state.submittedAt;
    onSuccess?.();
  }, [onSuccess, state.submittedAt, state.success]);

  // ダイアログを閉じた場合など、フォームが破棄されるタイミングでも一時URLを解放する。
  useEffect(() => {
    return () => {
      if (imagePreviewObjectUrlRef.current) {
        URL.revokeObjectURL(imagePreviewObjectUrlRef.current);
      }

      if (backgroundImagePreviewObjectUrlRef.current) {
        URL.revokeObjectURL(backgroundImagePreviewObjectUrlRef.current);
      }
    };
  }, []);

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
          accept={IMAGE_UPLOAD_ACCEPT}
          hidden
          disabled={isPending}
          onChange={handleBackgroundImageChange}
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
                accept={IMAGE_UPLOAD_ACCEPT}
                hidden
                disabled={isPending}
                onChange={handleImageChange}
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

          {profileImageErrors.map((error, index) => (
            <p key={`${error}-${index}`} className="text-sm text-red-500">
              {error}
            </p>
          ))}

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
