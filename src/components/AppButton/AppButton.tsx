import { ButtonHTMLAttributes } from "react"
import { ButtonProps, Button as MantineButton } from "@mantine/core"

type CustomButtonProps = ButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "style">

export function AppButton(props: CustomButtonProps) {
  return <MantineButton size="md" loaderProps={{ type: "dots" }} {...props} />
}
