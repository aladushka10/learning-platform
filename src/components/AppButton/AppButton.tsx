import { Button, type ButtonProps } from "@mantine/core"
import type { MouseEventHandler } from "react"

type AppButtonProps = ButtonProps & {
  type?: "button" | "submit" | "reset"
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export function AppButton(props: AppButtonProps) {
  return <Button {...props} />
}
