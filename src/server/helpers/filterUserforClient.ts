import { type User } from "@clerk/nextjs/dist/types/server";

export const filterUserFunction = (user: User) => ({
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  });