import type { ReactNode } from "react"
import {
  Box,
  Center,
  Overlay,
  Paper,
  Portal,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { AppButton } from "../AppButton/AppButton"

export function AppState({
  title,

  actionLabel,
  onAction,
  fullHeight = true,
}: {
  title: string

  actionLabel?: string
  onAction?: () => void
  fullHeight?: boolean
}) {
  const content = (
    <Paper withBorder radius="lg" p="xl" className="w-full max-w-xl">
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={3} m={0} mb={5}>
            {title}
          </Title>
        </Stack>
        {actionLabel && onAction ? (
          <AppButton
            onClick={onAction}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {actionLabel}
          </AppButton>
        ) : null}
      </Stack>
    </Paper>
  )

  return fullHeight ? (
    <Portal>
      <Overlay fixed color="#515252" opacity={0.9} blur={4} zIndex={9999} />
      <Center pos="fixed" inset={0} p="xl" style={{ zIndex: 10000 }}>
        <Box w="100%" maw={640}>
          {content}
        </Box>
      </Center>
    </Portal>
  ) : (
    content
  )
}
