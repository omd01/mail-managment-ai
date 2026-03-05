import { Wrench } from "lucide-react"

export default function Maintenance() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <Wrench className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Under Maintenance</h1>
        <p className="mb-8 text-muted-foreground">
          We're currently performing scheduled maintenance on our servers. We'll be back shortly!
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Expected completion: <span className="font-medium">2 hours</span>
        </p>
      </div>
    </div>
  )
}
