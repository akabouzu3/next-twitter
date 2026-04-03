"use client";

import { useEffect, useRef } from "react";
import { ImageIcon } from "lucide-react";

/**
 * 画像アップロードボタンのProps
 */
type Props = {
  // 投稿中など、操作を禁止したいときに使う
  isPending: boolean;
  // 親コンポーネントで管理している現在選択済みの画像一覧
  selectedImages: File[];
  // ファイル選択時に親へ通知するコールバック
  onSelect: (files: File[]) => void;
};

export function ImageUploadButton({
  isPending,
  selectedImages,
  onSelect,
}: Props) {
  /**
   * hidden の file input を直接操作するための ref
   *
   * button を押したときに input を click させるために使う
   */
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * DataTransfer を保持する ref
   *
   * input.files は直接自由に配列のように編集できないため、
   * DataTransfer を使って FileList を再構築する
   */
  const dataTransferRef = useRef<DataTransfer | null>(null);

  /**
   * selectedImages が変わるたびに、
   * input 要素の files と同期する
   *
   * これをしておくことで、親で保持している画像状態と
   * 実際の input の中身を一致させられる
   */
  useEffect(() => {
    // FileList を組み立てるための DataTransfer を新しく作る
    const dt = new DataTransfer();

    // 現在選択中の画像をすべて DataTransfer に追加する
    selectedImages.forEach((file) => {
      dt.items.add(file);
    });

    // 必要に応じて参照できるよう ref に保持
    dataTransferRef.current = dt;

    // hidden input の files に、再構築した FileList をセットする
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  }, [selectedImages]);

  /**
   * 画像追加ボタン押下時の処理
   *
   * hidden input をプログラムで click して
   * ファイル選択ダイアログを開く
   */
  const handleClick = () => {
    // 投稿中は選択不可
    if (isPending) return;

    // hidden input を開く
    fileInputRef.current?.click();
  };

  /**
   * ファイル選択時の処理
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    // 何も選ばれていなければ終了
    if (!files || files.length === 0) return;

    // FileList は配列ではないので Array.from で配列化して親へ渡す
    onSelect(Array.from(files));

    /**
     * 同じファイルを連続で選択したときにも onChange が発火するように、
     * input の value を空文字に戻しておく
     *
     * これをしないと、同じ画像を再度選んだときに change イベントが
     * 発火しないことがある
     */
    e.currentTarget.value = "";
  };

  return (
    <>
      {/* 
        実際にファイルを選択する input
        UI上は表示せず、button から操作する
      */}
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {/* 
        ユーザーが押す見た目上の画像追加ボタン
        押すと hidden input が開く
      */}
      <button
        type="button"
        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={handleClick}
        aria-label="画像を追加"
      >
        <ImageIcon className="size-5" />
      </button>
    </>
  );
}