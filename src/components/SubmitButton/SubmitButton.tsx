import { Button, ButtonProps } from "@mantine/core"

export function SubmitButton({
  children,
  onClick,
  ...props
}: ISubmitButtonProps) {
  return (
    <Button type="submit" size="lg" mt="sm" onClick={onClick} {...props}>
      {children}
    </Button>
  )
}
interface ISubmitButtonProps extends ButtonProps {
  onClick?: () => void
}
