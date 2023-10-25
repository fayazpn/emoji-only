import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { author, content, createdAt, id } = props;

  return (
    <div className="flex gap-3 border-b border-slate-400 p-8" key={props.id}>
      <Image
        src={author.imageUrl}
        alt="Profile Image"
        className="rounded-full"
        height={56}
        width={56}
        // placeholder="blur"
        // blurDataURL={author.blurredDataUrl}
      />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-500">
          <Link href={`/@${author.username}`}>
            <span className="font-bold text-slate-300">{`@${author.username}`}</span>
          </Link>
          <Link href={`/posts/${id}`}>
            <span>· </span>
            <span>{dayjs().to(createdAt)}</span>
          </Link>
        </div>
        <span>{content}</span>
      </div>
    </div>
  );
};

export default PostView;
