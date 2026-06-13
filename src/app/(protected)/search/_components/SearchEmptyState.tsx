type Props = {
  title: string;
  description: string;
};

/**
 * 検索タブの空状態。
 *
 * top / latest の実データ取得を追加するまでのプレースホルダーとしても使う。
 */
export default function SearchEmptyState({ title, description }: Props) {
  return (
    <div className="px-8 py-14 text-center">
      <h2 className="text-xl font-extrabold leading-6 text-white">{title}</h2>
      <p className="mt-3 text-[15px] leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}
