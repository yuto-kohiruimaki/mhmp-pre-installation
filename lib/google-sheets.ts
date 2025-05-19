import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import type { FormData } from "@/types/form"

// Questions in the order they should appear in the spreadsheet
const QUESTIONS: string[] = [
  "店舗名",
  "店舗電話番号",
  "営業時間",
  "工事作業申請の対応に防災や施設管理と直接やり取りする必要があるか？",
  "施設のご担当者様のお名前",
  "施設のご担当者様の電話番号",
  "店舗窓口_お名前",
  "店舗窓口_電話番号",
  "防災センターご連絡先_お名前",
  "防災センターご連絡先_電話番号",
  "店舗外観_正面",
  "店舗外観_左",
  "店舗外観_右",
  "店舗内観_天井",
  "バックヤード全体",
  "サーバーラック内",
  // 工事申請情報
  "作業不可日の有無",
  "営業時間中の工事作業の可否",
  "営業時間中の工事作業の可否（その他詳細）", // その他の詳細を追加
  "工事するまでの要な書類",
  "申請の提出方法",
  "FAX番号",
  "メールアドレス",
  "その他提出方法詳細", // その他の詳細
  // 作業申請の際のお約束を2つに分割
  "施設所定のイントラなどの場合の必要項目",
  "作業申請の締め切り",
  // 工事書類を4つの別々の列に分ける
  "工事作業申請書",
  "夜間警備申請書",
  "高所作業申請書",
  "その他書類",
  "入館時の遵守事項",
  "荷捌き上の遵守事項",
  "入館説明用資料",
  "入館地図",
  // 作業詳細情報
  "作業員の車両駐車について",
  "作業員の車両駐車について（その他詳細）", // その他の詳細を追加
  "夜間の作業時間に制限があるか",
  "制限の詳細",
  "営業時間外（夜間作業）時に自動消灯されるか",
  "自動消灯の場合の解除方法",
  "バックヤードの鍵の管理について",
  "サーバーラックの鍵の管理について",
  "その他留意事項",
  "送信日時",
]

// 工事作業可否の表示用マッピング
const constructionPossibilityLabels: Record<string, string> = {
  possible: "作業可能",
  impossible: "作業不可",
  partially: "条件つきで可能",
  other: "その他",
}

// 申請方法の表示用マッピング
const submissionMethodLabels: Record<string, string> = {
  fax: "FAX",
  email: "メール",
  other: "その他",
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

const documentLabels: Record<string, string> = {
  construction: "工事作業申請書",
  fire: "夜間警備申請書",
  facility: "高所作業申請書",
  other: "その他書類",
}

console.log("BUCKET_NAME:", process.env.BUCKET_NAME)
console.log("REGION:", process.env.REGION)

// S3 base URL for public access
const s3BaseUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com`

export async function appendToSheet(formData: FormData) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SHEET_ID!, serviceAccountAuth)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]

    const requiredColumns = QUESTIONS.length
    if (sheet.columnCount < requiredColumns) {
      console.log(`Resizing sheet from ${sheet.columnCount} to ${requiredColumns} columns`)
      await sheet.resize({
        rowCount: Math.max(sheet.rowCount, 1000), // 行数は現在の行数か1000のいずれか大きい方を維持
        columnCount: requiredColumns,
      })
      // リサイズ後に再度シート情報を読み込む
      await doc.loadInfo()
      const updatedSheet = doc.sheetsByIndex[0]
      console.log(`Sheet resized to ${updatedSheet.columnCount} columns`)
    }

    // ヘッダー行を確認して、必要に応じて追加
    try {
      const headers = await sheet.headerValues

      // ヘッダーが存在するが、列数が足りない場合は更新
      if (headers && headers.length < QUESTIONS.length) {
        await sheet.setHeaderRow(QUESTIONS)
      } else if (!headers || headers.length === 0) {
        // ヘッダーがない場合はヘッダーを設定
        await sheet.setHeaderRow(QUESTIONS)
      }
    } catch (e) {
      // エラーが発生した場合はヘッダーを設定
      await sheet.setHeaderRow(QUESTIONS)
    }

    // 写真URL (既にオブジェクトとして受け取る)
    const photoUrls: Record<string, string> = formData.photoUrls || {}

    // 各写真のフルURLを生成
    const photoFullUrls = Object.entries(photoUrls).reduce(
      (acc, [key, path]) => {
        acc[key] = `${s3BaseUrl}/${path}`
        return acc
      },
      {} as Record<string, string>,
    )

    // 工事書類のURLを生成（存在する場合）
    let constructionDocumentUrls: Record<string, string> = {}
    if (formData.constructionDocuments) {
      const documents = JSON.parse(formData.constructionDocuments) as Record<string, string>
      Object.entries(documents).forEach(([key, url]) => {
        // URLが既にS3の完全なURLの場合はそのまま使用し、そうでない場合はS3のURLを構築
        if (url.startsWith('http')) {
          constructionDocumentUrls[key] = url
        } else {
          constructionDocumentUrls[key] = `${s3BaseUrl}/${url}`
        }
      })
    }

    // 現在の日本時間を取得
    const now = new Date();
    const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9時間
    const formattedJapanTime = japanTime.toISOString().replace('T', ' ').substring(0, 19);

    // Format the data to match the headers
    const rowData = {
      [QUESTIONS[0]]: formData.storeName,
      [QUESTIONS[1]]: formData.phoneNumber,
      [QUESTIONS[2]]: formData.businessHours || "-",
      [QUESTIONS[3]]: formData.needsDirectCommunication === "yes" ? "はい" : "いいえ",
      [QUESTIONS[4]]: formData.managerName || "-",
      [QUESTIONS[5]]: formData.managerPhone || "-",
      [QUESTIONS[6]]: formData.storeContactName || "-",
      [QUESTIONS[7]]: formData.storeContactPhone || "-",
      [QUESTIONS[8]]: formData.disasterPreventionCenterName || "-",
      [QUESTIONS[9]]: formData.disasterPreventionCenterPhone || "-",
      [QUESTIONS[10]]: photoFullUrls.front || "-",
      [QUESTIONS[11]]: photoFullUrls.left || "-",
      [QUESTIONS[12]]: photoFullUrls.right || "-",
      [QUESTIONS[13]]: photoFullUrls.ceiling || "-",
      [QUESTIONS[14]]: photoFullUrls.backyard || "-",
      [QUESTIONS[15]]: photoFullUrls.server || "-",
      // 工事申請情報
      [QUESTIONS[16]]: formData.unavailableDates || "-",
      [QUESTIONS[17]]: formData.constructionPossibility
        ? constructionPossibilityLabels[formData.constructionPossibility]
        : "-",
      [QUESTIONS[18]]: formData.constructionPossibilityOther || "-", // その他の詳細
      [QUESTIONS[19]]: formData.requiredDocuments
        ? JSON.stringify(formData.requiredDocuments.map((doc) => documentLabels[doc] || doc))
        : "-",
      [QUESTIONS[20]]: formData.submissionMethod ? submissionMethodLabels[formData.submissionMethod] : "-",
      [QUESTIONS[21]]: formData.faxNumber || "-",
      [QUESTIONS[22]]: formData.emailAddress || "-",
      [QUESTIONS[23]]: formData.otherSubmissionDetails || "-", // その他の詳細
      // 作業申請の際のお約束を2つに分割
      [QUESTIONS[24]]: formData.requiredItems || "-",
      [QUESTIONS[25]]: formData.applicationDeadline || "-",
      // 工事書類を4つの別々の列に分ける
      [QUESTIONS[26]]: constructionDocumentUrls.construction || "-",
      [QUESTIONS[27]]: constructionDocumentUrls.fire || "-",
      [QUESTIONS[28]]: constructionDocumentUrls.facility || "-",
      [QUESTIONS[29]]: constructionDocumentUrls.other || "-",
      [QUESTIONS[30]]: formData.entryProcedures || "-",
      [QUESTIONS[31]]: formData.loadingProcedures || "-",
      [QUESTIONS[32]]: formData.facilityDocumentUrl ? `${s3BaseUrl}/${formData.facilityDocumentUrl}` : "-",
      [QUESTIONS[33]]: formData.entranceMapUrl ? `${s3BaseUrl}/${formData.entranceMapUrl}` : "-",
      [QUESTIONS[34]]: formData.parkingOption
        ? parkingOptionLabels[formData.parkingOption as keyof typeof parkingOptionLabels] || formData.parkingOption
        : "-",
      [QUESTIONS[35]]: formData.parkingOptionOther || "-", // その他の詳細
      [QUESTIONS[36]]:
        formData.nightTimeRestriction === "yes" ? "ある" : formData.nightTimeRestriction === "no" ? "ない" : "-",
      [QUESTIONS[37]]: formData.restrictionDetails || "-",
      [QUESTIONS[38]]:
        formData.autoLightOff === "yes" ? "自動消灯" : formData.autoLightOff === "no" ? "自動消灯なし" : "-",
      [QUESTIONS[39]]: formData.lightOffDetails || "-",
      [QUESTIONS[40]]: formData.backyardKeyManagement || "-",
      [QUESTIONS[41]]: formData.serverRackKeyManagement || "-",
      [QUESTIONS[42]]: formData.otherConsiderations || "-",
      [QUESTIONS[43]]: formattedJapanTime, // 送信日時（日本時間）を追加
    }

    // Add the new row
    await sheet.addRow(rowData)

    return { success: true }
  } catch (error) {
    console.error("Error appending to sheet:", error)
    return { success: false, error: `Failed to save data: ${error}` }
  }
}