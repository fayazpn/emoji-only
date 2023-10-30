import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../api/root";
import { db } from "../db";
import superjson from "superjson";

export const generateSSGHelper = () => createServerSideHelpers({
    router: appRouter,
    ctx: { db: db, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });