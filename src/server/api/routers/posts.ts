import { clerkClient } from "@clerk/nextjs";
import { type Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { getPlaiceholder } from "plaiceholder";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserFunction } from "~/server/helpers/filterUserforClient";

// Abstract util function to attach author data in post data
const addAuthorDetailsOnPosts = async (postsData: Post[]) => {
  const userList = (
    await clerkClient.users.getUserList({
      limit: 100,
      userId: postsData.map((post) => post.authorId),
    })
  ).map(filterUserFunction);

  // const base64Promises = userList.map((user) => toBase64(user.imageUrl));
  // const base64Results = await Promise.all(base64Promises);

  // const userListWithBlur = userList.map((user, i) => {
  //   return { ...user, blurredDataUrl: base64Results[i]! };
  // });

  return postsData.map((post) => {
    const author = userList.find((user) => user.id === post.authorId);

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
};

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

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const postsData = await ctx.db.post.findMany({
      take: 100,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return addAuthorDetailsOnPosts(postsData);
  }),

  createPosts: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Enter valid emoji").min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      // Rate limit function, on success being true only allows the request forward, or throws error
      const { success } = await ratelimit.limit(authorId);

      console.log(success, "ratelimiter success");

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Post limit exceeded",
        });
      }

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(
      async ({ ctx, input }) =>
        await ctx.db.post
          .findMany({
            where: {
              authorId: input.userId,
            },
            take: 100,
            orderBy: [{ createdAt: "desc" }],
          })
          .then(addAuthorDetailsOnPosts),
    ),
});
