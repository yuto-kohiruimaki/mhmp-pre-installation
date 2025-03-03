import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface SuccessPageProps {
  onReset: () => void
}

export function SuccessPage({ onReset }: SuccessPageProps) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-primary pb-4">
        <CardTitle className="text-white text-xl">回答を送信しました</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <p className="text-lg font-medium">ご回答ありがとうございました</p>
        <p className="text-muted-foreground mt-2">回答が正常に記録されました。</p>
        <Button className="mt-6" onClick={onReset}>
          別の回答を送信
        </Button>
      </CardContent>
    </Card>
  )
}

