import { ReactNode } from "react"
import { Paper, Stack, Title } from "@mantine/core"
import { AppButton } from "../AppButton/AppButton"

interface TaskSidebarCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  ctaLabel?: string
  ctaIcon?: ReactNode
  onClick?: () => void
  ctaDisabled?: boolean
  ctaVariant?: "filled" | "outline" | "light" | "subtle" | "default"
  ctaClassName?: string
}

export function TaskSidebarCard({
  title,
  icon,
  children,
  ctaLabel,
  ctaIcon,
  onClick,
  ctaDisabled,
  ctaVariant = "outline",
  ctaClassName,
}: TaskSidebarCardProps) {
  return (
    <Paper withBorder radius="lg" p="xl">
      <Stack gap="md">
        <div className="flex items-center gap-2">
          {icon}
          <Title order={4} className="text-lg font-semibold text-gray-900">
            {title}
          </Title>
        </div>
        {children}
        {ctaLabel && (
          <AppButton
            variant={ctaVariant}
            leftSection={ctaIcon}
            onClick={onClick}
            disabled={ctaDisabled}
            className={ctaClassName ?? "w-full h-12"}
          >
            {ctaLabel}
          </AppButton>
        )}
      </Stack>
    </Paper>
  )
}
