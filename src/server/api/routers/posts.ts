import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPlaiceholder } from "plaiceholder";

const filterUserFunction = (user: User) => ({
  id: user.id,
  username: user.username,
  imageUrl: user.imageUrl,
});

const toBase64 = async (imgUrl: string) => {
  try {
    const res = await fetch(imgUrl);
    const buffer = await res.arrayBuffer();

    const { base64 } = await getPlaiceholder(Buffer.from(buffer));

    return base64;
  } catch (error) {
    throw new TRPCError({
      code: "PARSE_ERROR",
      message: "Cannot create blur image!",
    });
  }
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const postsData = await ctx.db.post.findMany({ take: 100 });

    const userList = (
      await clerkClient.users.getUserList({
        limit: 100,
        userId: postsData.map((post) => post.authorId),
      })
    ).map(filterUserFunction);

    const base64Promises = userList.map((user) => toBase64(user.imageUrl));
    const base64Results = await Promise.all(base64Promises);

    const userListWithBlur = userList.map((user, i) => {

      return { ...user, blurredDataUrl: base64Results[i]! };
    });

    return postsData.map((post) => {
      const author = userListWithBlur.find((user) => user.id === post.authorId);

      if (!author?.username)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found!",
        });

      return {
        ...post,
        author: {
          ...author,
          username: author.username,
        },
      };
    });
  }),
});
