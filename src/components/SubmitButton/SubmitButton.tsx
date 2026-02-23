import { Button, ButtonProps } from "@mantine/core"

export function SubmitButton({ children, ...props }: ButtonProps) {
  return (
    <Button type="submit" size="lg" mt="sm" {...props}>
      {children}
    </Button>
  )
}
