import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserFunction = (user: User) => ({
  id: user.id,
  username: user.username,
  imageUrl: user.imageUrl,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const postsData = await ctx.db.post.findMany({ take: 100 });

    const userList = (
      await clerkClient.users.getUserList({
        limit: 100,
        userId: postsData.map((post) => post.authorId),
      })
    ).map(filterUserFunction);

    return postsData.map((post) =>{ 
      const author = userList.find((user) => user.id === post.authorId)

      if(!author?.username)
        throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: 'Author not found!'})
      
      return {
      ...post,
      author: {
        ...author,
        username: author.username
      }
    }});


  }),
});
