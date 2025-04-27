import { type ToastActionElement, type ToastProps } from "./toast"

export declare function toast(props: {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}): {
  id: string
  dismiss: () => void
  update: (props: ToastProps) => void
}

export declare function useToast(): {
  toast: typeof toast
  dismiss: (toastId?: string) => void
  toasts: ToastProps[]
} 