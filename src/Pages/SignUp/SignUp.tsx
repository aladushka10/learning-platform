import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react"
import { signUpUser, clearError } from "../../store/signUpSlice"
import { z } from "zod"
import { MTextInput } from "../../components/MTextInput/MTextInput"
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Image,
} from "@mantine/core"
import logoSrc from "../../assets/LP-sign.svg"
import { Icon } from "lucide-react"

const signUpSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string(),
    firstName: z.string().trim().min(1, "Please fill in required fields"),
    lastName: z.string().optional(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  })
type SignUpFormValues = z.infer<typeof signUpSchema>

const SignUp = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state: any) => state.signUp)

  const [formData, setFormData] = useState<SignUpFormValues>({
    email: "",
    password: "",
    passwordConfirm: "",
    firstName: "",
    lastName: "",
  })

  const [localError, setLocalError] = useState("")

  const handleFieldChange = <K extends keyof SignUpFormValues>(
    field: K,
    value: SignUpFormValues[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setLocalError("")
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    const parsed = signUpSchema.safeParse(formData)
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message || "Invalid form")
      return
    }

    ;(dispatch as any)(
      signUpUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }),
    )
  }

  useEffect(() => {
    if (success) {
      navigate("/", { replace: true })
    }
  }, [success, navigate])

  return (
    <Container size={560} className="min-h-screen flex items-center py-12">
      <Stack gap="lg" className="w-full">
        <Image src={logoSrc} alt="LP" h={48} fit="contain" />

        <Paper
          withBorder
          radius="xl"
          p="xl"
          shadow="md"
          className="border-gray-100 shadow-lg"
        >
          <Stack gap="lg">
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              size="lg"
              onClick={() => navigate("/")}
            >
              <IconArrowLeft size={18} />
            </ActionIcon>

            <Stack gap={6}>
              <Title order={2}>Create account</Title>
              <Text c="dimmed" m={0}>
                Join the platform and start learning
              </Text>
            </Stack>

            {(localError || error) && (
              <Alert
                color="red"
                radius="lg"
                icon={<IconAlertCircle size={16} />}
              >
                {localError || error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <MTextInput
                    label="First Name"
                    placeholder="John"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.currentTarget.value)
                    }
                    required
                    radius="lg"
                  />

                  <MTextInput
                    label="Last Name"
                    placeholder="Doe"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.currentTarget.value)
                    }
                    radius="lg"
                  />
                </SimpleGrid>

                <MTextInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleFieldChange("email", e.currentTarget.value)
                  }
                  required
                  radius="lg"
                />

                <Stack gap={6}>
                  <MTextInput
                    label="Password"
                    type="password"
                    placeholder="At least 6 characters"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.currentTarget.value)
                    }
                    required
                    radius="lg"
                  />
                  <Text size="xs" c="dimmed" m={0}>
                    Minimum 6 characters
                  </Text>
                </Stack>

                <MTextInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={(e) =>
                    handleFieldChange("passwordConfirm", e.currentTarget.value)
                  }
                  required
                  radius="lg"
                />

                <Button
                  type="submit"
                  fullWidth
                  radius="lg"
                  size="md"
                  loading={loading}
                  rightSection={<IconArrowRight size={16} />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Account
                </Button>

                <Text ta="center" c="dimmed" size="sm" m={0}>
                  Already have an account?
                </Text>

                <Button
                  type="button"
                  variant="default"
                  fullWidth
                  radius="lg"
                  size="md"
                  onClick={() => navigate("/sign-in")}
                  className="border-gray-200 bg-white hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Text ta="center" size="xs" c="dimmed" m={0}>
              By signing up, you agree to our Terms of Service
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default SignUp
