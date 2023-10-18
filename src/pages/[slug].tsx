import Head from "next/head";
import { type GetStaticPropsContext, type NextPage } from "next";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";

const ProfilePage: NextPage<{username: string}> = ({username}) => {
  const user = api.profile.getUserByUsername.useQuery({ username });

  return (
    <>
      <Head>
        <title>{username}</title>
      </Head>
      <main className="flex justify-center">
        <div>Posts by id</div>
      </main>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";
import superjson from "superjson";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ slug: string }>,
) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db: db, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug

  if (typeof slug !== "string") throw new Error("no slug")

  const username = slug.replace("@", "")

  await ssg.profile.getUserByUsername.prefetch({username: username})

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  }
};

export const getStaticPaths = () => {
  return {paths:[], fallback: "blocking"}
}

export default ProfilePage;
