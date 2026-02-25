import {
  IconArrowLeft,
  IconCode,
  IconPlayerPlay,
  IconBook,
} from "@tabler/icons-react"
import {
  Badge,
  Button,
  Code,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core"
import { AppButton } from "../AppButton/AppButton"
const CodeTaskPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex items-center justify-between">
          <AppButton
            variant="subtle"
            leftSection={<IconArrowLeft size={20} />}
            className="px-0 text-blue-600 hover:text-blue-700"
          >
            Вернуться
          </AppButton>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center">
            Название задачи
          </h1>

          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Paper
              withBorder
              radius="lg"
              p="xl"
              className="border-l-4 border-l-blue-600"
            >
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Title
                      order={3}
                      // className="text-2xl font-semibold text-gray-900"
                    >
                      Условие задачи
                    </Title>
                    <p className="text-lg text-gray-700 mt-4 leading-relaxed">
                      Текст условия.
                    </p>
                  </div>

                  <Group gap="xs">
                    <Badge
                      variant="light"
                      color="blue"
                      leftSection={<IconCode size={14} />}
                    >
                      Код
                    </Badge>
                    <Badge variant="outline" color="gray">
                      Легко
                    </Badge>
                    <Badge variant="outline" color="gray">
                      JavaScript
                    </Badge>
                  </Group>
                </Group>
              </Stack>
            </Paper>

            <Paper withBorder radius="lg" p="xl">
              <Stack gap="lg">
                <Group justify="space-between" align="center">
                  <Title order={3} className="text-xl font-semibold">
                    Ваше решение
                  </Title>

                  <AppButton leftSection={<IconPlayerPlay size={15} />}>
                    Запустить тесты
                  </AppButton>
                </Group>

                <Textarea
                  placeholder={`// Напишите решение здесь…\nexport function solve() {\n  \n}\n`}
                  autosize
                  minRows={14}
                  className="font-mono"
                />
              </Stack>
            </Paper>
          </div>

          <div className="space-y-8">
            <Paper withBorder radius="lg" p="xl">
              <Stack gap="md">
                <h3 className="text-xl font-semibold text-gray-900">Тесты</h3>

                <Table withTableBorder withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Case</Table.Th>
                      <Table.Th>Expected</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>
                        <Code>solve(1)</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>2</Code>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>
                        <Code>solve(5)</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>10</Code>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>

            <Paper withBorder radius="lg" p="xl">
              <Stack gap="md">
                <h3 className="text-xl font-semibold text-gray-900">Теория</h3>

                <p className="text-gray-600 text-base">
                  Тут будет ссылка на лекцию, связанную с заданием.
                </p>

                <Button
                  variant="outline"
                  leftSection={<IconBook size={18} />}
                  component="a"
                  href="/"
                  className="h-12"
                >
                  Открыть лекцию
                </Button>
              </Stack>
            </Paper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeTaskPage
