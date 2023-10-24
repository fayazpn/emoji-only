import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLoader } from "~/components/Loading";
import PageLayout from "~/components/PageLayout";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

function CreatePostWizard() {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.createPosts.useMutation({
    onSuccess: () => {
      setInput("");
      // add void instead as this function doesnt care about what happens to the promise
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Could not post. Please try again later!");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        className="rounded-full"
        height={64}
        width={64}
      />
      <input
        type="text"
        className="grow bg-transparent outline-none"
        value={input}
        placeholder="Type some emojis to tweet"
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            mutate({ content: input });
          }
        }}
      />
      {input !== "" && (
        <button
          className="rounded-full border-2 border-slate-100 px-5 py-2 hover:bg-slate-500/50"
          onClick={() => mutate({ content: input })}
        >
          Post
        </button>
      )}
    </div>
  );
}

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
        placeholder="blur"
        blurDataURL={author.blurredDataUrl}
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

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <PageLoader />;

  return <>{data?.map((post) => <PostView {...post} key={post.id} />)}</>;
};

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // start fetching before Feed component is mounted
  api.posts.getAll.useQuery();

  // Return empty if user is not loaded
  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className=" flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>

        <Feed />
      </PageLayout>
    </>
  );
}
