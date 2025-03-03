"use client"

import { useState } from "react"
import type { FormData } from "@/types/form"
import type { InitialFormValues, FacilityManagerFormValues } from "@/lib/schema"
import { InitialForm } from "./initial-form"
import { FacilityManagerForm } from "./facility-manager-form"
import { ConfirmationPage } from "./confirmation-page"
import { SuccessPage } from "./success-page"
import { PhotoUploadForm } from "./photo-upload-form"
import { submitSurvey } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    phoneNumber: "",
    needsDirectCommunication: "",
    managerName: "",
    managerPhone: "",
    photoUrls: "",
  })

  function handleInitialSubmit(values: InitialFormValues) {
    const updatedData = {
      ...formData,
      storeName: values.storeName,
      phoneNumber: values.phoneNumber,
      needsDirectCommunication: values.needsDirectCommunication,
      ...(values.needsDirectCommunication !== "yes" && {
        managerName: "",
        managerPhone: "",
      }),
    }
    setFormData(updatedData)

    if (values.needsDirectCommunication === "yes") {
      setCurrentStep(2)
    } else {
      setCurrentStep(3)
    }
  }

  function handleFacilityManagerSubmit(values: FacilityManagerFormValues) {
    setFormData((prev) => ({
      ...prev,
      managerName: values.managerName,
      managerPhone: values.managerPhone,
    }))
    setCurrentStep(3)
  }

  const handlePhotoUpload = (urls: Record<string, string>) => {
    setPhotoUrls(urls)
    setCurrentStep(4)
  }

  function handleBack() {
    if (currentStep === 4) {
      if (formData.needsDirectCommunication === "yes") {
        setCurrentStep(3)
      } else {
        setCurrentStep(2)
      }
    } else if (currentStep === 3) {
      if (formData.needsDirectCommunication === "yes") {
        setCurrentStep(2)
      } else {
        setCurrentStep(1)
      }
    } else if (currentStep === 2) {
      setFormData((prev) => ({
        ...prev,
        managerName: "",
        managerPhone: "",
      }))
      setCurrentStep(1)
    }
  }

  async function handleFinalSubmit() {
    try {
      setIsSubmitting(true)
      const result = await submitSurvey(formData, photoUrls)

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

  function handleReset() {
    setFormData({
      storeName: "",
      phoneNumber: "",
      needsDirectCommunication: "",
      managerName: "",
      managerPhone: "",
      photoUrls: "",
    })
    setPhotoUrls({})
    setCurrentStep(1)
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return <SuccessPage onReset={handleReset} />
  }

  if (currentStep === 2) {
    return (
      <FacilityManagerForm
        defaultValues={{
          managerName: formData.managerName,
          managerPhone: formData.managerPhone,
        }}
        onSubmit={handleFacilityManagerSubmit}
        onBack={handleBack}
      />
    )
  }

  if (currentStep === 3) {
    return <PhotoUploadForm onNext={handlePhotoUpload} onBack={handleBack} storeName={formData.storeName} />
  }

  if (currentStep === 4) {
    return (
      <ConfirmationPage
        formData={formData}
        onBack={handleBack}
        onSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <InitialForm
      defaultValues={{
        storeName: formData.storeName,
        phoneNumber: formData.phoneNumber,
        needsDirectCommunication: formData.needsDirectCommunication as "yes" | "no",
      }}
      onSubmit={handleInitialSubmit}
    />
  )
}

