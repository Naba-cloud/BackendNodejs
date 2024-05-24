import mongoose from "mongoose";
const SubscriptionModel = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timeStamps: true }
);
export const Subscription = new mongoose.model(
  "Subscription",
  SubscriptionModel
);
