import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoFileSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },

  { timestamps: true },
  "VideoFile"
);
videoFileSchema.plugin(mongooseAggregatePaginate);
export const VideoFile = module("VideoFile", videoFileSchema);
