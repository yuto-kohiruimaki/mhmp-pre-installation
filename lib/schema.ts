import * as z from "zod"

export const initialFormSchema = z.object({
  storeName: z.string().min(1, { message: "店舗名を入力してください" }),
  phoneNumber: z.string().min(1, { message: "電話番号を入力してください" }),
  needsDirectCommunication: z.enum(["yes", "no"], {
    required_error: "選択してください",
  }),
})

export const facilityManagerFormSchema = z.object({
  managerName: z.string().min(1, { message: "担当者様のお名前を入力してください" }),
  managerPhone: z.string().min(1, { message: "電話番号を入力してください" }),
})

export type InitialFormValues = z.infer<typeof initialFormSchema>
export type FacilityManagerFormValues = z.infer<typeof facilityManagerFormSchema>

