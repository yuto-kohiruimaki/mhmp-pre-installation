export type FormData = {
  storeName: string
  phoneNumber: string
  needsDirectCommunication: string
  managerName: string
  managerPhone: string
  photoUrls: string
  // 工事申請情報
  unavailableDates?: string
  constructionPossibility?: "possible" | "impossible" | "partially" | "other"
  constructionPossibilityOther?: string // その他の場合の詳細
  requiredDocuments?: string[]
  submissionMethod?: "fax" | "email" | "other"
  faxNumber?: string
  emailAddress?: string
  otherSubmissionDetails?: string
  // 作業申請の際のお約束を2つに分割
  requiredItems?: string // 施設所定のイントラなどの場合の必要項目
  applicationDeadline?: string // 作業申請の締め切り
  constructionDocuments?: string
  // 入館時の注意事項
  entryProcedures?: string
  loadingProcedures?: string
  facilityDocumentUrl?: string

  // 作業詳細情報
  parkingOption?: string
  parkingOptionOther?: string // その他の場合の詳細
  nightTimeRestriction?: string
  restrictionDetails?: string
  autoLightOff?: string
  lightOffDetails?: string
  backyardKeyManagement?: string
  serverRackKeyManagement?: string
  otherConsiderations?: string
}

export type InitialFormData = {
  storeName: string
  phoneNumber: string
  needsDirectCommunication: "yes" | "no"
}

export type FacilityManagerFormData = {
  managerName: string
  managerPhone: string
}

