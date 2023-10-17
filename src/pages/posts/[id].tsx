import Head from "next/head"
import {type NextPage } from "next";

const SinglePostPage: NextPage = () => {


    return (
      <>
      <Head>
        <title>Post</title>
      </Head>
        <main className="flex justify-center">
            <div>Posts by id</div>
        </main>
      </>
    );
  }

  export default SinglePostPage
