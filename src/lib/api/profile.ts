// src/lib/api/profile.ts
import { createClient } from "../supabase/client";

const supabase = createClient();

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile (username, first_name, last_name, etc.)
 */
export async function updateProfile(updates: {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export async function uploadAvatar(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Max 2MB.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only images allowed.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
    throw new Error("Invalid file extension.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Create a unique file name
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/avatar.${fileExt}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Replace if exists
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  // Update profile with avatar URL
  await updateProfile({ avatar_url: publicUrl });

  return publicUrl;
}

/**
 * Delete avatar
 */
export async function deleteAvatar() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const fileName = `${user.id}/avatar`;

  // Delete from storage (will delete all file extensions)
  const { error: deleteError } = await supabase.storage
    .from("avatars")
    .remove([fileName]);

  // Don't throw error if file doesn't exist
  if (deleteError && deleteError.message !== "Object not found") {
    throw deleteError;
  }

  // Remove avatar URL from profile
  await updateProfile({ avatar_url: undefined });
}

/**
 * Update user email
 */
export async function updateEmail(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) throw error;

  // Also update in profiles table
  await supabase
    .from("profiles")
    .update({ email: newEmail })
    .eq("id", data.user.id);

  return data;
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

/**
 * Delete user account
 * NOTE: This requires admin privileges, so you'll need to set up an edge function
 * or use the Supabase dashboard. For now, this will mark the account for deletion.
 */
export async function deleteAccount() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Mark profile as inactive
  await supabase
    .from("profiles")
    .update({ status: "INACTIVE" })
    .eq("id", user.id);

  // Sign out
  await supabase.auth.signOut();

  // Note: Actual user deletion from auth.users requires admin API call
  // You'll need to set up an edge function or handle this server-side
  // For now, marking as inactive and signing out
}

/**
 * Get avatar URL for a user
 */
export function getAvatarUrl(avatarPath: string | null) {
  if (!avatarPath) return null;

  // If it's already a full URL, return it
  if (avatarPath.startsWith("http")) return avatarPath;

  // Otherwise, construct the public URL
  const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
  return data.publicUrl;
}
