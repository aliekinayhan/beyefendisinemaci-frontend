import api from "./axiosInstance";
import axios from "axios";

const uploadWithPresignedUrl = async (file, endpoint) => {
  const extension = file.name.split(".").pop();
  const res = await api.get(
    `/api/s3/upload/presigned-url/${endpoint}?extension=${extension}`,
  );
  const { uploadUrl, cloudFrontUrl } = res.data;
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });
  return { data: cloudFrontUrl };
};

export const uploadProfilePhoto = (file) =>
  uploadWithPresignedUrl(file, "profile-photo");
export const uploadCoverPhoto = (file) =>
  uploadWithPresignedUrl(file, "cover-photo");
export const uploadLongVideo = (file) =>
  uploadWithPresignedUrl(file, "video-long");
export const uploadShortVideo = (file) =>
  uploadWithPresignedUrl(file, "video-short");
