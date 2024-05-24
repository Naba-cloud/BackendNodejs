import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    // console.log("p", refreshToken);
    // console.log(accessToken);
    // user["refreshToken"] = user.generateRefreshToken();
    console.log("user2", user);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend or user
  // validation req data empty nh ho
  // ceck if user already exists email,username
  // CECK FOR IMAGES,AVATAR
  // upload them to cloudinary,Avatar uploaded or not
  // create user object
  // create entry IN DB
  // remove password and refresh token
  // check for user crearion
  // return response

  const { username, fullName, email, password } = req.body;
  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields must be required");
  }
  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userExists) {
    throw new ApiError(409, "User already exists");
  }
  const avatarImage = req.files?.avatar[0].path;
  let coverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  )
    coverImage = req.files?.coverImage[0].path;
  if (!avatarImage) throw new ApiError(400, "Avatar must be required");
  const avatar = await uploadOnCloudinary(avatarImage);
  const cover = await uploadOnCloudinary(coverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar file must be required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    email,
    coverImage: cover?.url || "",
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }
  console.log("username", username);
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});
const logInUser = asyncHandler(async (req, res) => {
  // getting data from req.body
  // username or email
  // find the user
  // password check
  // accesstoken and refresh token
  // send cookies to user
  // return response
  const { username, email, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "username or email is required");
  }
  const userFound = await User.findOne({ $or: [{ email, username }] });
  if (!userFound) throw new ApiError(400, "User not exist");
  const isPasswordValid = await userFound.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");
  console.log("TEST", userFound._id);
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userFound._id
  );
  // console.log("r", refreshToken);
  const loggedInUser = await User.findById(userFound._id).select(
    "-password -refreshToken"
  );
  console.log("LOGGEDiNuSER", loggedInUser);
  const options = { httpOnly: true, secure: true };
  console.log("accessToken", accessToken);
  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  console.log("RES", res);
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },

    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LoggedOut Successfully"));
});

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

export const refreshToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    (await req.cookies.refreshToken) || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "UnAuthorized Request");
  }
  console.log("IN", incomingRefreshToken);
  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log("decoded", decodedRefreshToken);
    const user = await User.findById(decodedRefreshToken?._id);
    console.log("user", user);
    if (!user) throw new ApiError(401, "InValid REFRESH Token");
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token is expired or reused");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const newRefreshToken = await generateAccessAndRefereshTokens(user?._id);
    console.log("new", newRefreshToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(201, { accessToken, refreshToken: newRefreshToken })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Password is required");
  }
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password updated successfully "));
});
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched successfully"));
});
export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(404, "Full name or email not provided");
  }
  req.email = email;
  req.fullName = fullName;
  const user = await User.findByIdAndUpdate(
    { id: req.user?._id },
    { set: { email: email, fullName: fullName } },
    { new: true }
  ).select("-password");
  return res.json(
    200,
    new ApiResponse(200, user, "Accont Details Updated Successfully")
  );
});
// export const updateUserAvatar = asyncHandler(async (req, res) => {
//   const avatarLocalPath = req.file?.path;
//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is missing");
//   }

//   //TODO: delete old image - assignment
//   const userToBeDeleted = await User.findOne(req.user?._id);
//   if (!userToBeDeleted) {
//     throw new ApiError(400, "User not found");
//   }
//   console.log("User to be deleted", userToBeDeleted);

//   await deleteFromCloudinary(userToBeDeleted?.avatar);

//   const avatar = await uploadOnCloudinary(avatarLocalPath);

//   if (!avatar.url) {
//     throw new ApiError(400, "Error while uploading on avatar");
//   }

//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         avatar: avatar.url,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Avatar image updated successfully"));
// });
export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Fetch user document to get the old avatar URL
  const userToBeDeleted = await User.findOne(req.user?._id);
  if (!userToBeDeleted) {
    throw new ApiError(400, "User not found");
  }

  // Log the user document to be deleted
  console.log("User to be deleted", userToBeDeleted);
  const parts = userToBeDeleted?.avatar.split("/");

  // Get the last part of the URL, which contains the filename with extension
  const lastPart = parts[parts.length - 1];

  // Remove the file extension (assuming it's always ".png")
  const fileNameWithoutExtension = lastPart.replace(".png", "");
  // Delete old avatar image from Cloudinary
  try {
    await deleteFromCloudinary(fileNameWithoutExtension, false);
  } catch (error) {
    console.error("Error while deleting old avatar:", error);
    // Handle deletion error if necessary
  }

  // Upload new avatar image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading new avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  //TODO: delete old image - assignment
  const deletecoverImage = await deleteFromCloudinary(coverImageLocalPath);
  if (!deletecoverImage.url) {
    throw new ApiError(400, "Error while deleteing on avatar");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
export const getUserChannelProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "Subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        $channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
      },
      isSubscribed: {
        $cond: {
          if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        $channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel Profile"));
});
export const getWatchHistory = asyncHandler(async (req, res, next) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user?._id),
      },
    },
    {
      $lookup: {
        from: "Videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
            },
          },
          {
            $addFields: {
              $owner: {
                $first: "owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History Fetched successfully"
      )
    );
});

export { registerUser, logInUser, logOutUser };
