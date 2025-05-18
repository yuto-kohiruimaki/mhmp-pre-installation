"use client"

import { useState, useEffect } from "react"
import type { FormData } from "@/types/form"
import type { InitialFormValues, FacilityManagerFormValues, ConstructionFormValues } from "@/lib/schema"
import { InitialForm } from "./initial-form"
import { FacilityManagerForm } from "./facility-manager-form"
import { ConfirmationPage } from "./confirmation-page"
import { SuccessPage } from "./success-page"
import { PhotoUploadForm } from "./photo-upload-form"
import { ConstructionForm } from "./construction-form"
import { submitSurvey } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"
import { FacilityAccessForm } from "./facility-access-form"
import type { FacilityAccessFormValues } from "@/lib/schema"
import { WorkDetailsForm } from "./work-details-form"
import type { WorkDetailsFormValues } from "@/lib/schema"

// フォームのステップを定義
enum FormStep {
  INITIAL = 1,
  FACILITY_MANAGER = 2,
  PHOTO_UPLOAD = 3,
  CONSTRUCTION = 4,
  FACILITY_ACCESS = 5,
  WORK_DETAILS = 6,
  CONFIRMATION = 7,
}

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.INITIAL)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    phoneNumber: "",
    businessHours: "",
    needsDirectCommunication: "",
    managerName: "",
    managerPhone: "",
    photoUrls: {} as Record<string, string>,
    storeContactName: "",
    storeContactPhone: "",
    disasterPreventionCenterName: "",
    disasterPreventionCenterPhone: "",
  })


  // ステップが変更されたときにページトップにスクロール
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [currentStep, isSubmitted])

  // 初期フォームの送信処理
  function handleInitialSubmit(values: InitialFormValues) {
    setFormData((prev) => ({
      ...prev,
      storeName: values.storeName,
      phoneNumber: values.phoneNumber,
      businessHours: values.businessHours,
      needsDirectCommunication: values.needsDirectCommunication,
    }))

    // 直接やり取りが必要な場合は施設担当者フォームへ、そうでなければ写真アップロードへ
    if (values.needsDirectCommunication === "yes") {
      setCurrentStep(FormStep.FACILITY_MANAGER)
    } else {
      setCurrentStep(FormStep.PHOTO_UPLOAD)
    }
  }

  // 施設担当者フォームの送信処理
  function handleFacilityManagerSubmit(values: FacilityManagerFormValues) {
    setFormData((prev) => ({
      ...prev,
      managerName: values.managerName,
      managerPhone: values.managerPhone,
      storeContactName: values.storeContactName,
      storeContactPhone: values.storeContactPhone,
      disasterPreventionCenterName: values.disasterPreventionCenterName,
      disasterPreventionCenterPhone: values.disasterPreventionCenterPhone,
    }))
    setCurrentStep(FormStep.PHOTO_UPLOAD)
  }

  // 写真アップロードフォームの送信処理
  function handlePhotoUpload(urls: Record<string, string>) {
    setFormData((prev) => ({
      ...prev,
      photoUrls: urls,
    }))
    setCurrentStep(FormStep.CONSTRUCTION)
  }

  // 工事申請フォームの送信処理
  function handleConstructionSubmit(values: ConstructionFormValues & { documents: Record<string, string> }) {
    setFormData((prev) => ({
      ...prev,
      unavailableDates: values.unavailableDates,
      constructionPossibility: values.constructionPossibility,
      constructionPossibilityOther: values.constructionPossibilityOther,
      requiredDocuments: values.requiredDocuments,
      submissionMethod: values.submissionMethod,
      faxNumber: values.faxNumber,
      emailAddress: values.emailAddress,
      otherSubmissionDetails: values.otherSubmissionDetails,
      requiredItems: values.requiredItems,
      applicationDeadline: values.applicationDeadline,
      constructionDocuments: JSON.stringify(values.documents),
    }))
    setCurrentStep(FormStep.FACILITY_ACCESS)
  }

  // 入館時の注意事項フォームの送信処理
  function handleFacilityAccessSubmit(values: FacilityAccessFormValues & { documentUrl?: string }) {
    setFormData((prev) => ({
      ...prev,
      entryProcedures: values.entryProcedures,
      loadingProcedures: values.loadingProcedures,
      facilityDocumentUrl: values.documentUrl,
    }))
    setCurrentStep(FormStep.WORK_DETAILS)
  }

  // 作業詳細フォームの送信処理
  function handleWorkDetailsSubmit(values: WorkDetailsFormValues) {
    setFormData((prev) => ({
      ...prev,
      parkingOption: values.parkingOption,
      parkingOptionOther: values.parkingOptionOther,
      nightTimeRestriction: values.nightTimeRestriction,
      restrictionDetails: values.restrictionDetails,
      autoLightOff: values.autoLightOff,
      lightOffDetails: values.lightOffDetails,
      backyardKeyManagement: values.backyardKeyManagement,
      serverRackKeyManagement: values.serverRackKeyManagement,
      otherConsiderations: values.otherConsiderations,
    }))
    setCurrentStep(FormStep.CONFIRMATION)
  }

  // 戻るボタンの処理
  function handleBack() {
    switch (currentStep) {
      case FormStep.CONFIRMATION:
        setCurrentStep(FormStep.WORK_DETAILS)
        break
      case FormStep.WORK_DETAILS:
        setCurrentStep(FormStep.FACILITY_ACCESS)
        break
      case FormStep.FACILITY_ACCESS:
        setCurrentStep(FormStep.CONSTRUCTION)
        break
      case FormStep.CONSTRUCTION:
        setCurrentStep(FormStep.PHOTO_UPLOAD)
        break
      case FormStep.PHOTO_UPLOAD:
        if (formData.needsDirectCommunication === "yes") {
          setCurrentStep(FormStep.FACILITY_MANAGER)
        } else {
          setCurrentStep(FormStep.INITIAL)
        }
        break
      case FormStep.FACILITY_MANAGER:
        setCurrentStep(FormStep.INITIAL)
        break
      default:
        setCurrentStep(FormStep.INITIAL)
    }
  }

  // 最終送信処理
  async function handleFinalSubmit() {
    try {
      setIsSubmitting(true)
      const result = await submitSurvey(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      setIsSubmitted(true)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "データの送信に失敗しました。",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // フォームのリセット
  function handleReset() {
    setFormData({
      storeName: "",
      phoneNumber: "",
      businessHours: "",
      needsDirectCommunication: "",
      managerName: "",
      managerPhone: "",
      photoUrls: {} as Record<string, string>,
      storeContactName: "",
      storeContactPhone: "",
      disasterPreventionCenterName: "",
      disasterPreventionCenterPhone: "",
    })
    setCurrentStep(FormStep.INITIAL)
    setIsSubmitted(false)
  }

  // 送信完了後の表示
  if (isSubmitted) {
    return <SuccessPage onReset={handleReset} />
  }

  // 現在のステップに応じたフォームを表示
  switch (currentStep) {
    case FormStep.INITIAL:
      return (
        <InitialForm
          defaultValues={{
            storeName: formData.storeName,
            phoneNumber: formData.phoneNumber,
            businessHours: formData.businessHours,
            needsDirectCommunication: formData.needsDirectCommunication as "yes" | "no",
          }}
          onSubmit={handleInitialSubmit}
        />
      )

    case FormStep.FACILITY_MANAGER:
      return (
        <FacilityManagerForm
          defaultValues={{
            managerName: formData.managerName,
            managerPhone: formData.managerPhone,
            storeContactName: formData.storeContactName,
            storeContactPhone: formData.storeContactPhone,
            disasterPreventionCenterName: formData.disasterPreventionCenterName,
            disasterPreventionCenterPhone: formData.disasterPreventionCenterPhone,
          }}
          onSubmit={handleFacilityManagerSubmit}
          onBack={handleBack}
        />
      )

    case FormStep.PHOTO_UPLOAD:
      return <PhotoUploadForm onNext={handlePhotoUpload} onBack={handleBack} storeName={formData.storeName} />

    case FormStep.CONSTRUCTION:
      return (
        <ConstructionForm
          defaultValues={{
            unavailableDates: formData.unavailableDates,
            constructionPossibility: formData.constructionPossibility,
            constructionPossibilityOther: formData.constructionPossibilityOther,
            requiredDocuments: formData.requiredDocuments,
            submissionMethod: formData.submissionMethod,
            faxNumber: formData.faxNumber,
            emailAddress: formData.emailAddress,
            otherSubmissionDetails: formData.otherSubmissionDetails,
            requiredItems: formData.requiredItems,
            applicationDeadline: formData.applicationDeadline,
          }}
          onNext={handleConstructionSubmit}
          onBack={handleBack}
          storeName={formData.storeName}
        />
      )

    case FormStep.FACILITY_ACCESS:
      return (
        <FacilityAccessForm
          defaultValues={{
            entryProcedures: formData.entryProcedures,
            loadingProcedures: formData.loadingProcedures,
          }}
          onNext={handleFacilityAccessSubmit}
          onBack={handleBack}
          storeName={formData.storeName}
        />
      )

    case FormStep.WORK_DETAILS:
      return (
        <WorkDetailsForm
          defaultValues={{
            parkingOption: formData.parkingOption as any,
            parkingOptionOther: formData.parkingOptionOther,
            nightTimeRestriction: formData.nightTimeRestriction as "yes" | "no",
            restrictionDetails: formData.restrictionDetails,
            autoLightOff: formData.autoLightOff as "yes" | "no",
            lightOffDetails: formData.lightOffDetails,
            backyardKeyManagement: formData.backyardKeyManagement,
            serverRackKeyManagement: formData.serverRackKeyManagement,
            otherConsiderations: formData.otherConsiderations,
          }}
          onNext={handleWorkDetailsSubmit}
          onBack={handleBack}
        />
      )

    case FormStep.CONFIRMATION:
      return (
        <ConfirmationPage
          formData={formData}
          onBack={handleBack}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
        />
      )

    default:
      return null
  }
}
