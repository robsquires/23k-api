import { z } from "zod";

export const UserSchema = z.object({
    userId: z.string(),
    athleteId: z.string(),
})
export type User = z.infer<typeof UserSchema>;

export const ActivitySchema = z.object({
    activityId: z.number(),
    userId: z.string(),
    type: z.string(),
    distance: z.string(),
    startDate: z.string(),
    calories: z.string(),
    maxWatts: z.string()
});
export type Activity = z.infer<typeof ActivitySchema>;

export const StravaEventSchema = z.object({
    aspect_type: z.enum(["create", "update", "delete"]),
    event_time: z.number(),
    object_id: z.number(),
    object_type: z.string(),
    owner_id: z.number(),
    subscription_id: z.number(),
    updates: z.object({})
})
export type StravaEvent = z.infer<typeof StravaEventSchema>;

export const StravaWebhookEventSchema = z.object({
    userId: z.string(),
    data: StravaEventSchema
})
export type StravaWebhookEvent = z.infer<typeof StravaWebhookEventSchema>;
