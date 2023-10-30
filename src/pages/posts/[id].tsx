import type { GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLoader } from "~/components/Loading";
import PageLayout from "~/components/PageLayout";
import PostView from "~/components/PostView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const SinglePostPage: NextPage<{ postId: string }> = ({ postId }) => {
  const { data, isLoading } = api.posts.getById.useQuery({
    postId: postId,
  });

  if (!data) return <div>404</div>;
  if (isLoading) return <PageLoader />;
  return (
    <>
      <Head>
        <title>{`${data.content} | ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} key={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps = async (
  context: GetStaticPropsContext<{ id: string }>,
) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getById.prefetch({postId: id})

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId: id
    },
  };
};

export const getStaticPaths = () => {
  // Generate on load only not on build time
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
