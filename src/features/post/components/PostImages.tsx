import Image from "next/image";
import { FeedItem } from "@/features/post/types/feed";

type Props = {
  post: FeedItem;
};

export default function PostImages({post}: Props) {
  const images = post.images;
  const count = images.length;

  if (count === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
        <Image
          src={images[0].url}
          alt=""
          width={800}
          height={450}
          className="h-auto w-full object-cover"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
        {images.map((img) => (
          <div key={img.id} className="aspect-square overflow-hidden">
            <Image
              src={img.url}
              alt=""
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
        <div className="row-span-2 overflow-hidden">
          <Image
            src={images[0].url}
            alt=""
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
        {images.slice(1).map((img) => (
          <div key={img.id} className="overflow-hidden">
            <Image
              src={img.url}
              alt=""
              width={400}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">
      {images.map((img) => (
        <div key={img.id} className="aspect-square overflow-hidden">
          <Image
            src={img.url}
            alt=""
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}