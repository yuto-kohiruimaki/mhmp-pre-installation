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

// 工事作業可否の表示用マッピング
const constructionPossibilityLabels: Record<string, string> = {
  possible: "作業可能",
  impossible: "作業不可",
  partially: "条件つきで可能",
  other: "その他",
}

// 必要書類の表示用マッピング
const documentLabels: Record<string, string> = {
  construction: "工事作業申請書",
  fire: "消防作業申請書",
  facility: "設備管理申請書",
  other: "その他",
}

// 申請方法の表示用マッピング
const submissionMethodLabels: Record<string, string> = {
  fax: "FAX",
  email: "メール",
  other: "その他",
}

// 写真タイプの表示用マッピング
const photoTypeLabels: Record<string, string> = {
  front: "店舗外観（正面）",
  left: "店舗外観（左）",
  right: "店舗外観（右）",
  ceiling: "店舗内観（天井）",
  backyard: "バックヤード全体",
  server: "サーバーラック内",
}

// 駐車オプションの表示用マッピング
const parkingOptionLabels: Record<string, string> = {
  dedicated: "作業用駐車場あり",
  customer_free: "お客様用駐車場に駐車可能",
  customer_paid: "お客様用駐車場に駐車可能（有料）",
  nearby: "駐車なし、近隣の駐車場に停める必要があり",
  street: "路面上に駐車可能",
  other: "その他",
}

// はい・いいえの表示用マッピング
const yesNoLabels: Record<string, string> = {
  yes: "はい",
  no: "いいえ",
}

export function ConfirmationPage({ formData, onBack, onSubmit, isSubmitting }: ConfirmationPageProps) {
  // 写真URLをJSONからパース
  const photoUrls = formData.photoUrls ? (JSON.parse(formData.photoUrls) as Record<string, string>) : {}

  // 工事書類をJSONからパース
  const constructionDocuments = formData.constructionDocuments
    ? (JSON.parse(formData.constructionDocuments) as Record<string, string>)
    : {}

  // 必要書類をJSONからパース
  const requiredDocuments = formData.requiredDocuments || []

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

          {/* 写真アップロード情報 */}
          {Object.keys(photoUrls).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">アップロードされた写真</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(photoUrls).map(([key, url]) => (
                    <div key={key} className="border rounded-md p-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        {photoTypeLabels[key as keyof typeof photoTypeLabels] || key}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">{url}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 工事申請情報 */}
          {formData.unavailableDates && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">工事申請情報</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">作業不可日の有無</p>
                    <p className="text-base">{formData.unavailableDates}</p>
                  </div>

                  {formData.constructionPossibility && (
                    <div>
                      <p className="text-sm text-muted-foreground">営業時間中の工事作業の可否</p>
                      <p className="text-base">
                        {constructionPossibilityLabels[formData.constructionPossibility] ||
                          formData.constructionPossibility}
                      </p>
                      {formData.constructionPossibility === "other" && formData.constructionPossibilityOther && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">その他の詳細</p>
                          <p className="text-base whitespace-pre-line">{formData.constructionPossibilityOther}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {requiredDocuments.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">工事するまでの要な書類</p>
                      <ul className="list-disc pl-5 mt-1">
                        {requiredDocuments.map((doc) => (
                          <li key={doc} className="text-base">
                            {documentLabels[doc] || doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formData.submissionMethod && (
                    <div>
                      <p className="text-sm text-muted-foreground">申請の提出方法</p>
                      <p className="text-base">
                        {submissionMethodLabels[formData.submissionMethod] || formData.submissionMethod}
                      </p>

                      {formData.submissionMethod === "fax" && formData.faxNumber && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">FAX番号</p>
                          <p className="text-base">{formData.faxNumber}</p>
                        </div>
                      )}

                      {formData.submissionMethod === "email" && formData.emailAddress && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">メールアドレス</p>
                          <p className="text-base">{formData.emailAddress}</p>
                        </div>
                      )}

                      {formData.submissionMethod === "other" && formData.otherSubmissionDetails && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">その他の提出方法</p>
                          <p className="text-base">{formData.otherSubmissionDetails}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 作業申請の際のお約束を2つに分割 */}
                  {formData.requiredItems && (
                    <div>
                      <p className="text-sm text-muted-foreground">施設所定のイントラなどの場合の必要項目</p>
                      <p className="text-base whitespace-pre-line">{formData.requiredItems}</p>
                    </div>
                  )}

                  {formData.applicationDeadline && (
                    <div>
                      <p className="text-sm text-muted-foreground">作業申請の締め切り</p>
                      <p className="text-base whitespace-pre-line">{formData.applicationDeadline}</p>
                    </div>
                  )}

                  {Object.keys(constructionDocuments).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">アップロードされた書類</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(constructionDocuments).map(([key, url]) => (
                          <div key={key} className="border rounded-md p-2">
                            <p className="text-sm font-medium">{documentLabels[key] || key}</p>
                            <p className="text-xs text-muted-foreground break-all">{url}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {(formData.entryProcedures || formData.loadingProcedures || formData.facilityDocumentUrl) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">入館時の注意事項</h3>
                <div className="space-y-4">
                  {formData.entryProcedures && (
                    <div>
                      <p className="text-sm text-muted-foreground">入館時の遵守事項</p>
                      <p className="text-base whitespace-pre-line">{formData.entryProcedures}</p>
                    </div>
                  )}
                  {formData.loadingProcedures && (
                    <div>
                      <p className="text-sm text-muted-foreground">荷捌き上の遵守事項</p>
                      <p className="text-base whitespace-pre-line">{formData.loadingProcedures}</p>
                    </div>
                  )}
                  {formData.facilityDocumentUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground">入館説明用資料</p>
                      <p className="text-xs text-muted-foreground break-all">{formData.facilityDocumentUrl}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 作業詳細情報 */}
          {formData.parkingOption && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">その他作業具確認事項</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">作業員の車両駐車について</p>
                    <p className="text-base">
                      {parkingOptionLabels[formData.parkingOption as keyof typeof parkingOptionLabels] ||
                        formData.parkingOption}
                    </p>
                    {formData.parkingOption === "other" && formData.parkingOptionOther && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">その他の駐車方法の詳細</p>
                        <p className="text-base whitespace-pre-line">{formData.parkingOptionOther}</p>
                      </div>
                    )}
                  </div>

                  {formData.nightTimeRestriction && (
                    <div>
                      <p className="text-sm text-muted-foreground">夜間の作業時間に制限があるか</p>
                      <p className="text-base">
                        {yesNoLabels[formData.nightTimeRestriction as keyof typeof yesNoLabels]}
                      </p>
                    </div>
                  )}

                  {formData.nightTimeRestriction === "yes" && formData.restrictionDetails && (
                    <div>
                      <p className="text-sm text-muted-foreground">制限の詳細</p>
                      <p className="text-base whitespace-pre-line">{formData.restrictionDetails}</p>
                    </div>
                  )}

                  {formData.autoLightOff && (
                    <div>
                      <p className="text-sm text-muted-foreground">営業時間外（夜間作業）時に自動消灯されるか</p>
                      <p className="text-base">{formData.autoLightOff === "yes" ? "自動消灯" : "自動消灯なし"}</p>
                    </div>
                  )}

                  {formData.autoLightOff === "yes" && formData.lightOffDetails && (
                    <div>
                      <p className="text-sm text-muted-foreground">自動消灯の場合の解除方法</p>
                      <p className="text-base whitespace-pre-line">{formData.lightOffDetails}</p>
                    </div>
                  )}

                  {formData.backyardKeyManagement && (
                    <div>
                      <p className="text-sm text-muted-foreground">バックヤードの鍵の管理について</p>
                      <p className="text-base whitespace-pre-line">{formData.backyardKeyManagement}</p>
                    </div>
                  )}

                  {formData.serverRackKeyManagement && (
                    <div>
                      <p className="text-sm text-muted-foreground">サーバーラックの鍵の管理について</p>
                      <p className="text-base whitespace-pre-line">{formData.serverRackKeyManagement}</p>
                    </div>
                  )}

                  {formData.otherConsiderations && (
                    <div>
                      <p className="text-sm text-muted-foreground">その他留意事項</p>
                      <p className="text-base whitespace-pre-line">{formData.otherConsiderations}</p>
                    </div>
                  )}
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

