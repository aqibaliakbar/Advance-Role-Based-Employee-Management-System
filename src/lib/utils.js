import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { adminSupabase, supabase } from "./supabaseClient";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const uploadImage = async (file, userId, type) => {
  try {
    if (!file) return null;

    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image must be less than 5MB");
    }

    // Create file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file
    const { data, error: uploadError } = await adminSupabase.storage
      .from("cnic-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Generate signed URL
    const { data: signedData, error: signedError } = await adminSupabase.storage
      .from("cnic-images")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiry

    if (signedError) throw signedError;

    return signedData.signedUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};

export const getSignedUrl = async (url) => {
  try {
    if (!url) return null;

    // Extract path from signed URL
    const urlPath = url.split("cnic-images/")[1]?.split("?")[0];
    if (!urlPath) {
      throw new Error("Invalid URL format");
    }

    // Generate new signed URL
    const { data, error } = await adminSupabase.storage
      .from("cnic-images")
      .createSignedUrl(urlPath, 60 * 60 * 24 * 7); // 7 days expiry

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};

export const deleteImage = async (url) => {
  try {
    if (!url) return;

    // Extract path from signed URL
    const urlPath = url.split("cnic-images/")[1]?.split("?")[0];
    if (!urlPath) return;

    const { error } = await adminSupabase.storage
      .from("cnic-images")
      .remove([urlPath]);

    if (error) throw error;
  } catch (error) {
    console.error("Image delete error:", error);
    throw error;
  }
};

// Utility to refresh signed URLs that are about to expire
export const refreshSignedUrl = async (url) => {
  try {
    if (!url) return null;

    // Extract path from current signed URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(
      /\/object\/sign\/cnic-images\/(.*)\?/
    );
    if (!pathMatch) return url;

    const filePath = decodeURIComponent(pathMatch[1]);

    // Generate new signed URL
    const { data, error } = await adminSupabase.storage
      .from("cnic-images")
      .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days expiry

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error("Error refreshing signed URL:", error);
    return url; // Return original URL if refresh fails
  }
};
