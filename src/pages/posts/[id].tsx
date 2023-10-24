import { type NextPage } from "next";
import Head from "next/head";
import PageLayout from "~/components/PageLayout";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <PageLayout>Posts by Id page</PageLayout>
    </>
  );
};

export default SinglePostPage;
