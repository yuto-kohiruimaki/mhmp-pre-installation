import * as z from "zod"

// 電話番号とFAX番号のバリデーションパターンを追加
const PHONE_PATTERN = /^[0-9-]+$/

export const initialFormSchema = z.object({
  storeName: z.string().min(1, { message: "店舗名を入力してください" }),
  phoneNumber: z
    .string()
    .min(1, { message: "電話番号を入力してください" })
    .regex(PHONE_PATTERN, { message: "電話番号は数字とハイフンのみ入力可能です" }),
  needsDirectCommunication: z.enum(["yes", "no"], {
    required_error: "選択してください",
  }),
})

export const facilityManagerFormSchema = z.object({
  managerName: z.string().min(1, { message: "担当者様のお名前を入力してください" }),
  managerPhone: z
    .string()
    .min(1, { message: "電話番号を入力してください" })
    .regex(PHONE_PATTERN, { message: "電話番号は数字とハイフンのみ入力可能です" }),
})

export const constructionFormSchema = z.object({
  unavailableDates: z.string().min(1, { message: "作業不可日を入力してください" }),
  constructionPossibility: z.enum(["possible", "impossible", "partially", "other"], {
    required_error: "選択してください",
  }),
  constructionPossibilityOther: z.string().optional(),
  requiredDocuments: z.array(z.string()).min(1, { message: "少なくとも1つ選択してください" }),
  submissionMethod: z.enum(["fax", "email", "other"], {
    required_error: "選択してください",
  }),
  faxNumber: z
    .string()
    .optional()
    .refine((val) => !val || PHONE_PATTERN.test(val), {
      message: "FAX番号は数字とハイフンのみ入力可能です",
    }),
  emailAddress: z.string().email({ message: "有効なメールアドレスを入力してください" }).optional(),
  otherSubmissionDetails: z.string().optional(),
  // 作業申請の際のお約束を2つに分割
  requiredItems: z.string().optional(),
  applicationDeadline: z.string().min(1, { message: "作業申請の締め切りを入力してください" }),
})

export const facilityAccessFormSchema = z.object({
  entryProcedures: z.string().min(1, { message: "入館時の遵守事項を入力してください" }),
  loadingProcedures: z.string().min(1, { message: "荷捌き上の遵守事項を入力してください" }),
  facilityDocument: z.instanceof(File).optional(),
})

export const workDetailsFormSchema = z.object({
  parkingOption: z.enum(["dedicated", "customer_free", "customer_paid", "nearby", "street", "other"], {
    required_error: "選択してください",
  }),
  parkingOptionOther: z.string().optional(),
  nightTimeRestriction: z.enum(["yes", "no"], {
    required_error: "選択してください",
  }),
  restrictionDetails: z.string().optional(),
  autoLightOff: z.enum(["yes", "no"], {
    required_error: "選択してください",
  }),
  lightOffDetails: z.string().optional(),
  backyardKeyManagement: z.string().min(1, { message: "バックヤードの鍵の管理方法を入力してください" }),
  serverRackKeyManagement: z.string().min(1, { message: "サーバーラックの鍵の管理方法を入力してください" }),
  otherConsiderations: z.string().optional(),
})

export type InitialFormValues = z.infer<typeof initialFormSchema>
export type FacilityManagerFormValues = z.infer<typeof facilityManagerFormSchema>
export type ConstructionFormValues = z.infer<typeof constructionFormSchema>
export type FacilityAccessFormValues = z.infer<typeof facilityAccessFormSchema>
export type WorkDetailsFormValues = z.infer<typeof workDetailsFormSchema>

