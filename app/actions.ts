"use server"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { appendToSheet } from "@/lib/google-sheets"
import type { FormData } from "@/types/form"

const s3Client = new S3Client({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
})

// ファイル名のマッピング（設問項目に合わせる）
const FILE_NAMES = {
  front: "店舗外観_正面",
  left: "店舗外観_左",
  right: "店舗外観_右",
  ceiling: "店舗内観_天井",
  backyard: "バックヤード全体",
  server: "サーバーラック内",
  // 工事書類
  construction: "工事作業申請書",
  fire: "夜間警備申請書",
  facility: "高所作業申請書",
  other: "その他書類",
  // 入館説明用資���
  facility_document: "入館説明用の添付ファイル",
} as const

type UploadUrlResponse = {
  uploadUrl: string
  key: string
}

export async function getPresignedUrl(
  fileId: keyof typeof FILE_NAMES,
  storeName: string,
  contentType: string,
): Promise<UploadUrlResponse> {
  // 店舗名をそのまま使用（制限を削除）
  // URLに使用できない文字を置換（必要最小限の処理）
  const safeStoreName = storeName.replace(/[/\\:*?"<>|]/g, "_")

  // ファイル拡張子を決定
  let extension = ".png"
  if (contentType === "application/pdf") {
    extension = ".pdf"
  } else if (contentType.startsWith("image/")) {
    const format = contentType.split("/")[1]
    extension = format === "jpeg" ? ".jpg" : `.${format}`
  }

  // S3のキーを生成 (bucketName/店舗名/ファイル名.拡張子)
  const key = `${safeStoreName}/${FILE_NAMES[fileId]}${extension}`

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  return {
    uploadUrl,
    key,
  }
}

export async function submitSurvey(formData: FormData) {
  try {
    const result = await appendToSheet(formData)
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

