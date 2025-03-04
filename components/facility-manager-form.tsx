"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { facilityManagerFormSchema, type FacilityManagerFormValues } from "@/lib/schema"
import type { FacilityManagerFormData } from "@/types/form"

interface FacilityManagerFormProps {
  defaultValues?: FacilityManagerFormData
  onSubmit: (values: FacilityManagerFormValues) => void
  onBack: () => void
}

export function FacilityManagerForm({ defaultValues, onSubmit, onBack }: FacilityManagerFormProps) {
  const form = useForm<FacilityManagerFormValues>({
    resolver: zodResolver(facilityManagerFormSchema),
    defaultValues: defaultValues || {
      managerName: "",
      managerPhone: "",
    },
  })

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">施設ご担当者様情報</CardTitle>
        <CardDescription className="text-white/90">
          直接弊社側と施設の方で日程等やり取りする場合のご質問です。
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="managerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">施設のご担当者様のお名前</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      工事作業届け、申請等でやりとりさせていただく方の氏名（フリガナ含む）をお願いします。
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="回答を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">施設のご担当者様の電話番号 (ハイフンなしでご入力ください。)</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      工事作業届、申請等でやりとりさせていただく方のご連絡先をお願いします。①の店舗のご担当者様経由で申請等対応いただける場合は、省略ください。
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="例: 0312345678"
                        {...field}
                        onChange={(e) => {
                          // 数字とハイフン以外の文字を除去
                          const value = e.target.value.replace(/[^0-9-]/g, "")
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" type="button" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <Button type="submit">
              次へ <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

