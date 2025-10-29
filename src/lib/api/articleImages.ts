// Article Image Upload Utilities
// Add to ~/lib/api/articleImages.ts

import { createClient } from "../supabase/client";

export interface ArticleImage {
  id: string;
  article_id?: string;
  user_id: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  created_at: string;
}

const supabase = createClient();

/**
 * Upload an image for an article
 * @param file - The image file to upload
 * @param articleId - Optional article ID to associate with
 * @returns The public URL of the uploaded image
 */
export async function uploadArticleImage(
  file: File,
  articleId?: string
): Promise<{ url: string; record: ArticleImage }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("article-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("article-images").getPublicUrl(filePath);

  // Save record to database
  const { data: record, error: recordError } = await supabase
    .from("article_images")
    .insert({
      article_id: articleId,
      user_id: user.id,
      storage_path: filePath,
      public_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (recordError) throw recordError;

  return { url: publicUrl, record };
}

/**
 * Upload multiple images at once
 */
export async function uploadMultipleImages(
  files: File[],
  articleId?: string
): Promise<{ url: string; record: ArticleImage }[]> {
  const results = await Promise.all(
    files.map((file) => uploadArticleImage(file, articleId))
  );
  return results;
}

/**
 * Delete an image
 */
export async function deleteArticleImage(imageId: string): Promise<void> {
  // Get the image record first
  const { data: image, error: fetchError } = await supabase
    .from("article_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("article-images")
    .remove([image.storage_path]);

  if (storageError) throw storageError;

  // Delete record from database
  const { error: dbError } = await supabase
    .from("article_images")
    .delete()
    .eq("id", imageId);

  if (dbError) throw dbError;
}

/**
 * Get all images for an article
 */
export async function getArticleImages(
  articleId: string
): Promise<ArticleImage[]> {
  const { data, error } = await supabase
    .from("article_images")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user's uploaded images (for image library)
 */
export async function getUserImages(): Promise<ArticleImage[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("article_images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Update image alt text
 */
export async function updateImageAltText(
  imageId: string,
  altText: string
): Promise<void> {
  const { error } = await supabase
    .from("article_images")
    .update({ alt_text: altText })
    .eq("id", imageId);

  if (error) throw error;
}

/**
 * Generate markdown for an image
 */
export function generateImageMarkdown(
  url: string,
  altText: string = "Image"
): string {
  return `![${altText}](${url})`;
}

/**
 * Generate HTML img tag for an image
 */
export function generateImageHtml(
  url: string,
  altText: string = "Image",
  width?: number
): string {
  const widthAttr = width ? ` width="${width}"` : "";
  return `<img src="${url}" alt="${altText}"${widthAttr} />`;
}
