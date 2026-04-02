import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { z } from "zod"
import {
  Alert,
  Button,
  Container,
  Image,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import logoSrc from "../../assets/LP-sign.svg"
import { IconAlertCircle, IconArrowRight } from "@tabler/icons-react"
import { signInUser } from "../../store/signInSlice"
import { MTextInput } from "../../components/MTextInput/MTextInput"
import { AppButton } from "../../components/AppButton/AppButton"

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type SignInFormValues = z.infer<typeof signInSchema>

const SignIn = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    auth,
    isLoading,
    error: authError,
  } = useSelector((state: any) => state.signIn)

  const [formData, setFormData] = useState<SignInFormValues>({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const parsed = signInSchema.safeParse(formData)
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Invalid form")
        return
      }

      await (dispatch as any)(
        signInUser({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      ).unwrap()
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  useEffect(() => {
    if (auth) {
      navigate("/", { replace: true })
    }
  }, [auth, navigate])

  return (
    <Container size={680} className="min-h-screen flex items-center py-12">
      <Stack gap="lg" className="w-full" p="46">
        <Image src={logoSrc} alt="LP" h={100} fit="contain" />

        <Paper
          withBorder
          radius="xl"
          p="xl"
          shadow="md"
          className="border-gray-100 shadow-lg"
        >
          <Stack gap="lg">
            <Stack gap={6}>
              <Title order={2}>Welcome back</Title>
              <Text c="dimmed" m={0}>
                Sign in to continue learning
              </Text>
            </Stack>

            {(error || authError) && (
              <Alert
                color="red"
                radius="lg"
                icon={<IconAlertCircle size={16} />}
              >
                {error || authError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <MTextInput
                  label="Email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.currentTarget.value
                    setFormData((prev) => ({ ...prev, email: value }))
                  }}
                  required
                  radius="lg"
                  size="md"
                />

                <MTextInput
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    const value = e.currentTarget.value
                    setFormData((prev) => ({
                      ...prev,
                      password: value,
                    }))
                  }}
                  required
                  radius="lg"
                  size="md"
                />

                <AppButton
                  type="submit"
                  fullWidth
                  radius="lg"
                  size="md"
                  loading={isLoading}
                  rightSection={<IconArrowRight size={16} />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </AppButton>

                <Text ta="center" c="dimmed" size="sm" m={0}>
                  Don&apos;t have an account?
                </Text>

                <AppButton
                  type="button"
                  variant="outline"
                  fullWidth
                  radius="lg"
                  size="md"
                  onClick={() => navigate("/sign-up")}
                  className="border-gray-200 bg-white hover:bg-gray-50"
                >
                  Create Account
                </AppButton>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default SignIn
