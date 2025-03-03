"use server"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { appendToSheet } from "@/lib/google-sheets"
import type { FormData } from "@/types/form"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// ファイル名のマッピング（アルファベットのみ）
const FILE_NAMES = {
  front: "店舗外観_正面",
  left: "店舗外観_左",
  right: "店舗外観_右",
  ceiling: "店舗内観_天井",
  backyard: "バックヤード全体",
  server: "サーバーラック内",
} as const

type UploadUrlResponse = {
  uploadUrl: string
  key: string
}

export async function getPresignedUrl(
  photoId: keyof typeof FILE_NAMES,
  storeName: string,
  contentType: string,
): Promise<UploadUrlResponse> {
  // 店舗名をアルファベットと数字のみに制限

  // S3のキーを生成 (bucketName/店舗名/写真タイプ.png)
  const key = `${storeName}/${FILE_NAMES[photoId]}.png`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  return {
    uploadUrl,
    key,
  }
}

export async function submitSurvey(formData: FormData, photoUrls: Record<string, string>) {
  try {
    // S3のURLに適切なプレフィックスを追加
    const bucketName = process.env.AWS_BUCKET_NAME;
    const formattedPhotoUrls: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(photoUrls)) {
      formattedPhotoUrls[key] = `https://${bucketName}.s3.amazonaws.com/${value}`;
    }

    // Google Sheetsに保存するデータにS3のURLを追加
    const dataWithPhotos = {
      ...formData,
      photoUrls: JSON.stringify(formattedPhotoUrls),
    }

    const result = await appendToSheet(dataWithPhotos)
    if (!result.success) {
      throw new Error(result.error || "Failed to save data")
    }
    return { success: true }
  } catch (error) {
    console.error("Error submitting survey:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}