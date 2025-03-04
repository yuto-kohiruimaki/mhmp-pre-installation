"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight, Upload, Loader2 } from "lucide-react"
import { constructionFormSchema, type ConstructionFormValues } from "@/lib/schema"
import { useState } from "react"
import Image from "next/image"
import { getPresignedUrl } from "@/app/actions"

// 書類タイプのマッピング
const DOCUMENT_TYPES = {
  construction: "工事作業申請書",
  fire: "消防作業申請書",
  facility: "設備管理申請書",
  other: "その他書類",
} as const

const requiredDocuments = [
  {
    id: "construction",
    label: "工事作業申請書",
  },
  {
    id: "fire",
    label: "消防作業申請書",
  },
  {
    id: "facility",
    label: "設備管理申請書",
  },
  {
    id: "other",
    label: "その他",
  },
] as const

interface ConstructionFormProps {
  onNext: (values: ConstructionFormValues & { documents: Record<string, string> }) => void
  onBack: () => void
  defaultValues?: Partial<ConstructionFormValues>
  storeName: string
}

export function ConstructionForm({ onNext, onBack, defaultValues, storeName }: ConstructionFormProps) {
  const [documents, setDocuments] = useState<Record<string, File>>({})
  const [documentPreviews, setDocumentPreviews] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<ConstructionFormValues>({
    resolver: zodResolver(constructionFormSchema),
    defaultValues: defaultValues || {
      unavailableDates: "",
      constructionPossibility: "possible",
      requiredDocuments: [],
    },
  })

  const handleFileChange = (documentType: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください。")
      return
    }

    setDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }))

    // Create preview URL for images
    if (file.type.startsWith("image/")) {
      setDocumentPreviews((prev) => ({
        ...prev,
        [documentType]: URL.createObjectURL(file),
      }))
    }

    setError("")
  }

  // S3にファイルをアップロードする関数
  const uploadToS3 = async (file: File, documentType: string): Promise<string> => {
    try {
      // プリサインドURLを取得
      const { uploadUrl, key } = await getPresignedUrl(
        documentType as any, // 型の問題を回避するためにanyを使用
        storeName,
        file.type,
      )

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
      throw new Error("書類のアップロードに失敗しました")
    }
  }

  const onSubmit = async (values: ConstructionFormValues) => {
    setIsUploading(true)
    setError("")

    try {
      const documentUrls: Record<string, string> = {}

      // 各書類をS3にアップロード
      for (const [key, file] of Object.entries(documents)) {
        const s3Key = await uploadToS3(file, key)
        documentUrls[key] = s3Key
      }

      onNext({
        ...values,
        documents: documentUrls,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "ファイルのアップロードに失敗しました")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">工事申請情報</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          工事申請に必要な情報を入力してください。
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="unavailableDates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    作業不可日の有無 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    施設休館日や、工事作業がNGな日がある場合は記入をお願いします。特になければなしと記入ください。
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constructionPossibility"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    営業時間中の工事作業の可否 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    施設の営業時間に工事作業ができるかどうか、営業時間中でも可能な作業があるかどうかをお答えください。
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="possible" />
                        </FormControl>
                        <FormLabel className="font-normal">作業可能</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="impossible" />
                        </FormControl>
                        <FormLabel className="font-normal">作業不可</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="partially" />
                        </FormControl>
                        <FormLabel className="font-normal">条件つきで可能</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">その他</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("constructionPossibility") === "other" && (
              <FormField
                control={form.control}
                name="constructionPossibilityOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      その他の詳細 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="詳細を入力してください" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="requiredDocuments"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    工事するまでの要な書類 <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="space-y-2">
                    {requiredDocuments.map((document) => (
                      <FormField
                        key={document.id}
                        control={form.control}
                        name="requiredDocuments"
                        render={({ field }) => {
                          return (
                            <FormItem key={document.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(document.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), document.id])
                                      : field.onChange((field.value || []).filter((value) => value !== document.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{document.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document upload sections */}
            {requiredDocuments.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <h3 className="text-lg font-semibold">{doc.label}</h3>
                <div className="mt-2">
                  {documentPreviews[doc.id] && (
                    <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border mb-4">
                      <Image
                        src={documentPreviews[doc.id] || "/placeholder.svg"}
                        alt={doc.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    ファイルを選択
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange(doc.id)} />
                  </label>
                  {documents[doc.id] && (
                    <p className="mt-2 text-sm text-muted-foreground">選択済み: {documents[doc.id].name}</p>
                  )}
                </div>
              </div>
            ))}

            <FormField
              control={form.control}
              name="submissionMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    申請の提出方法 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="fax" />
                        </FormControl>
                        <FormLabel className="font-normal">FAX</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="email" />
                        </FormControl>
                        <FormLabel className="font-normal">メール</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">その他</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("submissionMethod") === "fax" && (
              <FormField
                control={form.control}
                name="faxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">FAXの場合、番号の記入</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="例: 03-1234-5678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("submissionMethod") === "email" && (
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">メールの場合、送付先アドレス</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="例: example@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("submissionMethod") === "other" && (
              <FormField
                control={form.control}
                name="otherSubmissionDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">その他の提出方法の詳細</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="詳細を入力してください" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 作業申請の際のお約束を2つに分割 */}
            <FormField
              control={form.control}
              name="requiredItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">施設所定のイントラなどの場合の必要項目</FormLabel>
                  <FormDescription>
                    施設所定のイントラなどの場合、入力に必要な項目を箇条書きで記入をお願いします。
                    作業員名、車両ナンバー、電話番号など、必要となる項目を記載ください。
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px]"
                      placeholder="例: 作業員名、車両ナンバー、電話番号など"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    作業申請の締め切り <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    作業申請の締め切りを記載をお願いいたします。夜間警備発生時の締め切りもいただけると助かります。
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px]"
                      placeholder="例: 作業の1週間前まで、夜間警備が必要な場合は2週間前まで"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={onBack} disabled={isUploading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  アップロード中...
                </>
              ) : (
                <>
                  画像をアップロードして次へ
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

