import type { GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <PageLoader />;
  if (!data || data.length === 0) return <div>User has not posted yet!</div>;

  return (
    <>
      {data.map((post) => (
        <PostView {...post} key={post.id} />
      ))}
    </>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>404 not found</div>;

  return (
    <>
      <Head>
        <title>{username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-[200px] bg-slate-500">
          {/* Add plaice holder here */}
          <Image
            alt={`${data.username}'s profile picture`}
            src={data.imageUrl}
            height={128}
            width={128}
            className="absolute bottom-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${username}`}</div>
        <div className="w-full border-b border-slate-400" />

        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import Image from "next/image";
import superjson from "superjson";
import { PageLoader } from "~/components/Loading";
import PageLayout from "~/components/PageLayout";
import PostView from "~/components/PostView";
import { db } from "~/server/db";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ slug: string }>,
) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db: db, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");
  console.log(username, "username");
  await ssg.profile.getUserByUsername.prefetch({ username: username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  // Generate on load only not on build time
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
