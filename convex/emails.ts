import { v } from "convex/values";

import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type AddEmailResult = {
  id: Id<"emails">;
  email: string;
  status: "created" | "existing";
};

const SPECIAL_WAITLIST_EMAILS = new Set([
  "nsl6265@stern.nyu.edu",
  "ntl2695@stern.nyu.edu",
  "ck3880@nyu.edu",
]);

function isAllowedWaitlistEmail(email: string) {
  return /^[^\s@]+@nyu\.edu$/.test(email) || SPECIAL_WAITLIST_EMAILS.has(email);
}

export const add = mutation({
  args: {
    email: v.string(),
  },
  returns: v.object({
    id: v.id("emails"),
    email: v.string(),
    status: v.union(v.literal("created"), v.literal("existing")),
  }),
  handler: async (ctx, args): Promise<AddEmailResult> => {
    const email = args.email.trim().toLowerCase();

    if (!isAllowedWaitlistEmail(email)) {
      throw new Error("Use your @nyu.edu email.");
    }

    const existing = await ctx.db
      .query("emails")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      return {
        id: existing._id,
        email: existing.email,
        status: "existing",
      };
    }

    const id = await ctx.db.insert("emails", {
      email,
      createdAt: Date.now(),
    });

    return {
      id,
      email,
      status: "created",
    };
  },
});
