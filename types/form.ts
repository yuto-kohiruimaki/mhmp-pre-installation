export type FormData = {
  storeName: string
  phoneNumber: string
  businessHours: string // added businessHours to FormData
  needsDirectCommunication: string
  managerName: string
  managerPhone: string
  storeContactName: string
  storeContactPhone: string
  disasterPreventionCenterName?: string
  disasterPreventionCenterPhone: string
  photoUrls: Record<string, string> // Changed from string
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
  entranceMapUrl?: string
  
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
  businessHours: string // 営業時間
  needsDirectCommunication: "yes" | "no"
}

export type FacilityManagerFormData = {
  managerName: string
  managerPhone: string
  storeContactName: string
  storeContactPhone: string
  disasterPreventionCenterName?: string
  disasterPreventionCenterPhone: string
}
