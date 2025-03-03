import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import type { FormData } from "@/types/form"

// Questions in the order they should appear in the spreadsheet
const QUESTIONS = [
  "店舗名",
  "店舗電話番号",
  "工事作業申請の対応に防災や施設管理と直接やり取りする必要があるか？",
  "施設のご担当者様のお名前",
  "施設のご担当者様の電話番号",
  "店舗外観_正面",
  "店舗外観_左",
  "店舗外観_右",
  "店舗内観_天井",
  "バックヤード全体",
  "サーバーラック内",
] as const

export async function appendToSheet(formData: FormData) {
  try {
    // Initialize auth
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SHEET_ID!, serviceAccountAuth)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]

    // ヘッダー行を確認して、必要に応じて追加
    try {
      await sheet.loadHeaderRow();
      // ヘッダーが正しく読み込めたら何もしない
    } catch (e) {
      // ヘッダーがない場合はヘッダーを設定
      await sheet.setHeaderRow(QUESTIONS);
    }

    // 写真URLをJSONからパース
    const photoUrls = JSON.parse(formData.photoUrls) as Record<string, string>;
    
    // Format the data to match the headers
    const rowData = {
      [QUESTIONS[0]]: formData.storeName,
      [QUESTIONS[1]]: formData.phoneNumber,
      [QUESTIONS[2]]: formData.needsDirectCommunication === "yes" ? "はい" : "いいえ",
      [QUESTIONS[3]]: formData.managerName || "-",
      [QUESTIONS[4]]: formData.managerPhone || "-",
      [QUESTIONS[5]]: photoUrls.front || "-",
      [QUESTIONS[6]]: photoUrls.left || "-",
      [QUESTIONS[7]]: photoUrls.right || "-",
      [QUESTIONS[8]]: photoUrls.ceiling || "-",
      [QUESTIONS[9]]: photoUrls.backyard || "-",
      [QUESTIONS[10]]: photoUrls.server || "-",
    }

    // Add the new row
    await sheet.addRow(rowData)

    return { success: true }
  } catch (error) {
    console.error("Error appending to sheet:", error)
    return { success: false, error: `Failed to save data: ${error}` }
  }
}