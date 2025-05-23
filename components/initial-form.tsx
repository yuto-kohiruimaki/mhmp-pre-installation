"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight } from "lucide-react"
import { initialFormSchema, type InitialFormValues } from "@/lib/schema"
import type { InitialFormData } from "@/types/form"

interface InitialFormProps {
  defaultValues?: InitialFormData
  onSubmit: (values: InitialFormValues) => void
}

export function InitialForm({ defaultValues, onSubmit }: InitialFormProps) {
  const form = useForm<InitialFormValues>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: defaultValues || {
      storeName: "",
      phoneNumber: "",
      businessHours: "",
    },
  })

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">店舗情報アンケート</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          以下の質問にお答えください。* は必須項目です。
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      店舗名 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="例: 〇〇店" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      店舗電話番号 (ハイフンなしでご入力ください。) <span className="text-red-500">*</span>
                    </FormLabel>
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

              <FormField
                control={form.control}
                name="businessHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      営業時間 (例: 10:00-20:00) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="例: 10:00-20:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-4">
            <Button type="submit">
              次へ <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
