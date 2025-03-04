"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight, Upload, Loader2 } from "lucide-react"
import { facilityAccessFormSchema, type FacilityAccessFormValues } from "@/lib/schema"
import { useState } from "react"
import { getPresignedUrl } from "@/app/actions"

interface FacilityAccessFormProps {
  onNext: (values: FacilityAccessFormValues & { documentUrl?: string }) => void
  onBack: () => void
  defaultValues?: Partial<FacilityAccessFormValues>
  storeName: string
}

export function FacilityAccessForm({ onNext, onBack, defaultValues, storeName }: FacilityAccessFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<FacilityAccessFormValues>({
    resolver: zodResolver(facilityAccessFormSchema),
    defaultValues: defaultValues || {
      entryProcedures: "",
      loadingProcedures: "",
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください。")
      return
    }

    setSelectedFile(file)
    setError("")
  }

  const uploadToS3 = async (file: File): Promise<string> => {
    try {
      const { uploadUrl, key } = await getPresignedUrl("facility_document" as any, storeName, file.type)

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
      throw new Error("ファイルのアップロードに失敗しました")
    }
  }

  const onSubmit = async (values: FacilityAccessFormValues) => {
    try {
      setIsUploading(true)
      setError("")

      let documentUrl: string | undefined

      if (selectedFile) {
        documentUrl = await uploadToS3(selectedFile)
      }

      onNext({
        ...values,
        documentUrl,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">入館時の注意事項、遵守事項</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          できる限り詳細にご回答いただけますと幸いです。
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="entryProcedures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    入館時の遵守事項 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    入館方法、駐車場から入館場所までのルート、その他留意事項をご記入ください。
                  </FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" placeholder="回答を入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loadingProcedures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    荷捌き上の遵守事項 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>荷捌き上の場所、駐車可能時間などをご記入ください。</FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" placeholder="回答を入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="text-base font-medium">入館説明用の添付ファイル（あれば）</FormLabel>
              <FormDescription>
                入館時、作業員に説明するために活用できる添付資料があれば、ご共有いただきたいです。
                なければ、添付なしで次の項目に移っていただいて結構です。
              </FormDescription>
              <div className="mt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  ファイルを選択
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </label>
                {selectedFile && <p className="mt-2 text-sm text-muted-foreground">選択済み: {selectedFile.name}</p>}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
          <FormDescription>
            <div className="text-right mr-5 mt-10">※画像を選択している場合、次へを押すと画像が自動アップロードされます。</div>
          </FormDescription>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={onBack} disabled={isUploading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  次へ <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

