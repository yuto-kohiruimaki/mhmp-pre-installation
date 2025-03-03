export type FormData = {
  storeName: string
  phoneNumber: string
  needsDirectCommunication: string
  managerName: string
  managerPhone: string
  photoUrls: string
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

