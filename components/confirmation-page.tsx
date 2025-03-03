import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import type { FormData } from "@/types/form"

interface ConfirmationPageProps {
  formData: FormData
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function ConfirmationPage({ formData, onBack, onSubmit, isSubmitting }: ConfirmationPageProps) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">入力内容の確認</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          入力内容をご確認ください。修正が必要な場合は「戻る」ボタンを押してください。
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">店舗情報</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">店舗名</p>
                <p className="text-base">{formData.storeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">店舗電話番号</p>
                <p className="text-base">{formData.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  工事作業申請の対応に防災や施設管理と直接やり取りする必要があるか？
                </p>
                <p className="text-base">{formData.needsDirectCommunication === "yes" ? "はい" : "いいえ"}</p>
              </div>
            </div>
          </div>

          {formData.needsDirectCommunication === "yes" && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">施設ご担当者様情報</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">担当者様のお名前</p>
                    <p className="text-base">{formData.managerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">担当者様の電話番号</p>
                    <p className="text-base">{formData.managerPhone}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          修正する
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              送信する <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

