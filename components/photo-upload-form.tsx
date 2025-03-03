"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronRight, Upload, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { getPresignedUrl } from "@/app/actions"

interface PhotoUploadFormProps {
  onNext: (photoUrls: Record<string, string>) => void
  onBack: () => void
  storeName: string
}

type PhotoUpload = {
  id: string
  title: string
  description: string
  file: File | null
  preview: string | null
}

const REQUIRED_PHOTOS: PhotoUpload[] = [
  {
    id: "front",
    title: "工事場所の写真撮影（店舗外より正面から見た写真）",
    description: "店舗全体が見えるような写真の撮影をお願いします。距離の関係で映らない可能性もあるので、正面左右で計3枚依頼しております。",
    file: null,
    preview: null,
  },
  {
    id: "left",
    title: "工事場所の写真撮影（店舗外よりひだりから見た写真）",
    description: "店舗全体が見えるような写真の撮影をお願いします。距離の関係で映らない可能性もあるので、正面左右で計3枚依頼しております。",
    file: null,
    preview: null,
  },
  {
    id: "right",
    title: "工事場所の写真撮影（店舗外よりみぎから見た写真）",
    description: "店舗全体が見えるような写真の撮影をお願いします。距離の関係で映らない可能性もあるので、正面左右で計3枚依頼しております。",
    file: null,
    preview: null,
  },
  {
    id: "ceiling",
    title: "店舗内の天井の写真",
    description: "工事作業の上で必要です。見り場の天井全面がわかるように撮影ください。",
    file: null,
    preview: null,
  },
  {
    id: "backyard",
    title: "工事場所の写真撮影（バックヤード全体）",
    description: "できる限りサーバーラックやが電器が映るように撮影をお願いいたします。",
    file: null,
    preview: null,
  },
  {
    id: "server",
    title: "工事場所の写真撮影（サーバーラック内（できればルーターやPOEが映るように）",
    description:
      "サーバーラック内のケーブルやケーブルがさされている端緒がわかる、添付の写真のような形で写真を撮影ください。",
    file: null,
    preview: null,
  },
] as const

const FILE_NAMES = {
  front: "front",
  left: "left",
  right: "right",
  ceiling: "ceiling",
  backyard: "backyard",
  server: "server",
}

export function PhotoUploadForm({ onNext, onBack, storeName }: PhotoUploadFormProps) {
  const [photos, setPhotos] = useState<PhotoUpload[]>(REQUIRED_PHOTOS)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (id: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください。")
      return
    }

    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, file, preview: URL.createObjectURL(file) } : p)))
    setError("")
  }

  const handleClear = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, file: null, preview: null } : p)))
  }

  const uploadToS3 = async (file: File, photoId: string): Promise<string> => {
    try {
      // プリサインドURLを取得
      const { uploadUrl, key } = await getPresignedUrl(photoId as keyof typeof FILE_NAMES, storeName, file.type)

      // S3に直接アップロード
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      return key
    } catch (error) {
      console.error("Error uploading to S3:", error)
      throw new Error("写真のアップロードに失敗しました")
    }
  }

  const handleSubmit = async () => {
    // Check if all photos are uploaded
    const missingPhotos = photos.filter((photo) => !photo.file)

    if (missingPhotos.length > 0) {
      setError("すべての写真をアップロードしてください。")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const photoUrls: Record<string, string> = {}

      // 各写真をS3にアップロード
      for (const photo of photos) {
        if (photo.file) {
          const key = await uploadToS3(photo.file, photo.id)
          photoUrls[photo.id] = key
        }
      }

      onNext(photoUrls)
    } catch (error) {
      setError(error instanceof Error ? error.message : "写真のアップロードに失敗しました")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">写真のアップロード</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          必要な写真をアップロードしてください。各写真のサイズは10MB以下にしてください。
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              <h3 className="text-lg font-semibold">{photo.title}</h3>
              <p className="text-sm text-muted-foreground">{photo.description}</p>
              <div className="mt-2">
                {photo.preview && (
                  <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border mb-4">
                    <Image src={photo.preview || "/placeholder.svg"} alt={photo.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    写真を選択
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange(photo.id)} />
                  </label>
                  {photo.file && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleClear(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">クリア</span>
                    </Button>
                  )}
                </div>
                {photo.file && <p className="mt-2 text-sm text-muted-foreground">選択中: {photo.file.name}</p>}
              </div>
            </div>
          ))}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onBack} disabled={isUploading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <Button onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              アップロードして次へ <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

