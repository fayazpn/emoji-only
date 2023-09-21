import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { type RouterOutputs, api } from "~/utils/api";

function CreatePostWizard() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex gap-3">
      <img
        src={user.imageUrl}
        alt="Profile Image"
        className="h-16 w-16 rounded-full"
      />
      <input
        type="text"
        className="grow bg-transparent outline-none"
        placeholder="Type some emojis to tweet"
      />
    </div>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { author, content } = props;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-8" key={props.id}>
      <img
        src={author.imageUrl}
        alt="Profile Image"
        className="h-16 w-16 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span>·</span>
          <span>1 hour ago</span>
        </div>
        <span>{content}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const { isSignedIn } = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading data...</div>;

  if (!data) return <div>Sorry something went wrong!</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className=" w-full  border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>

          <div>{data?.map((post) => <PostView {...post} key={post.id} />)}</div>
        </div>
      </main>
    </>
  );
}
