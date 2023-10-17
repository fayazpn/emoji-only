import Head from "next/head"
import {type NextPage } from "next";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const user = api.profile.getUserByUsername.useQuery({username: 'fayazpn'})

  console.log(user.data)
    return (
      <>
      <Head>
        <title>Profile</title>
      </Head>
        <main className="flex justify-center">
            <div>Posts by id</div>
        </main>
      </>
    );
  }

  export default ProfilePage