"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input" // Import Input
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { useState } from "react" // Import useState
import Image from "next/image" // Import Image
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { workDetailsFormSchema, type WorkDetailsFormValues } from "@/lib/schema"

interface WorkDetailsFormProps {
  onNext: (values: WorkDetailsFormValues) => void
  onBack: () => void
  defaultValues?: Partial<WorkDetailsFormValues>
}

const parkingOptions = [
  { value: "dedicated", label: "作業用駐車場あり" },
  { value: "customer_free", label: "お客様用駐車場に駐車可能" },
  { value: "customer_paid", label: "お客様用駐車場に駐車可能（有料）" },
  { value: "nearby", label: "駐車なし、近隣の駐車場に停める必要があり" },
  { value: "street", label: "路面上に駐車可能" },
  { value: "other", label: "その他" },
]

export function WorkDetailsForm({ onNext, onBack, defaultValues }: WorkDetailsFormProps) {
  const form = useForm<WorkDetailsFormValues>({
    resolver: zodResolver(workDetailsFormSchema),
    defaultValues: defaultValues || {
      parkingOption: undefined,
      nightTimeRestriction: undefined,
      restrictionDetails: "",
      autoLightOff: undefined,
      lightOffDetails: "",
      backyardKeyManagement: "",
      serverRackKeyManagement: "",
      entranceMapFile: undefined,
      otherConsiderations: "",
    },
  })

  const [entranceMapPreview, setEntranceMapPreview] = useState<string | null>(null)

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">その他作業具確認事項</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          以下のご回答をお願いいたします。なるべく情報詳しくなるいよう、詳細にご記入いただけますと幸いです。
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)}>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="parkingOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    作業員の車両駐車について <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    作業員は基本車両1台でお伺いする予定です。1台を止めさせていただく上で、防災センターにご確認いただきたいです。
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {parkingOptions.map((option) => (
                        <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={option.value} />
                          </FormControl>
                          <FormLabel className="font-normal">{option.label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("parkingOption") === "other" && (
              <FormField
                control={form.control}
                name="parkingOptionOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      その他の駐車方法の詳細 <span className="text-red-500">*</span>
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
              name="nightTimeRestriction"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    夜間の作業時間に制限があるか <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">ある</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">ない</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("nightTimeRestriction") === "yes" && (
              <FormField
                control={form.control}
                name="restrictionDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      どのような制限があるか、具体的にお教えください。
                    </FormLabel>
                    <FormDescription>
                      夜間の作業に制限がある場合の具体的な内容をお教えください。防災スタッフがいないため、○時まで、作業ができない。駐車場が、○時までしか使えない。など。
                    </FormDescription>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" placeholder="回答を入力" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="autoLightOff"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    営業時間外（夜間作業）時に自動消灯されるか <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>店舗によって、照明の操作方法が異なりますので、ご教示ください。</FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">自動消灯</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">自動消灯なし</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("autoLightOff") === "yes" && (
              <FormField
                control={form.control}
                name="lightOffDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      自動消灯の場合の解除方法
                    </FormLabel>
                    <FormDescription>
                      自動消灯時にどのように解除が可能か、わかる範囲でお教えください。自動消灯がない場合、なしとご記入ください。
                    </FormDescription>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" placeholder="回答を入力" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="backyardKeyManagement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    バックヤードの鍵の管理について <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    分電盤の確認等させていただくことも想定されるため、鍵をお預かりし、出入りさせていただくこととしています。その際の鍵の解除方法をご教示ください。電子施錠の場合はその解除番号もお願いします。
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
              name="entranceMapFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    入館口がわかる地図などがありましたら添付してください。
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null
                        field.onChange(file)
                        if (file && file.type.startsWith("image/")) {
                          setEntranceMapPreview(URL.createObjectURL(file))
                        } else {
                          setEntranceMapPreview(null)
                        }
                      }}
                    />
                  </FormControl>
                  {entranceMapPreview && (
                    <div className="mt-2 relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                      <Image src={entranceMapPreview} alt="入館口地図プレビュー" fill className="object-contain" />
                    </div>
                  )}
                  {field.value && !entranceMapPreview && (
                    <p className="text-sm text-muted-foreground mt-1">選択中のファイル: {field.value.name}</p>
                  )}
                   {field.value && entranceMapPreview && (
                    <p className="text-sm text-muted-foreground mt-1">選択中のファイル: {field.value.name}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serverRackKeyManagement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    サーバーラックの鍵の管理について <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    ルーター周りがあるラックです。必ず作業時に使用しますので、施錠されている場合は、鍵の解除方法をご教示ください。電子施錠の場合はその解除番号もお願いします。施錠されない場合は施錠なしとご記入ください。
                    <br />
                    以下の情報を参考に、可能な限り詳しくご記入をお願いいたします。
                    <br />
                    ・鍵の種類（例：ダイヤルキー、回しキー など）
                    <br />
                    ・鍵の保管場所（例：入館口ポストなど）
                    <br />
                    ・その他、鍵に関する注意点や特記事項
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
              name="otherConsiderations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">その他留意事項</FormLabel>
                  <FormDescription>
                  予めお伝えしておく必要があることがあれば、ご教示ください。<br />
                  例）・天井裏配線だと、申請に大幅な時間がかかる可能性がある<br />
                  　  ・高所作業の場合は、資格の提示が必要<br />
                  　  ・新設で穴あけ作業がある場合、アスベストの調査等も必要となる<br />
                  　  ・駐車場から荷捌き上まで距離がある<br />
                  </FormDescription>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" placeholder="回答を入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={onBack}>
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
