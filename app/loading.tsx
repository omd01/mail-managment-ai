import { Mail } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Mail className="h-10 w-10 text-primary animate-pulse" />
        <h1 className="text-xl font-semibold">Loading...</h1>
        <div className="mt-2 flex items-center justify-center">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[loading_1s_ease-in-out_infinite] rounded-full bg-primary"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
