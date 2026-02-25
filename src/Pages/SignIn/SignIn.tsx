import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { signInUser } from "../../store/signInSlice"
import { z } from "zod"
import { AppButton } from "../../components/AppButton/AppButton"
import { MTextInput } from "../../components/MTextInput/MTextInput"
import { SubmitButton } from "../../components/SubmitButton/SubmitButton"
import { Loader, Text, Title } from "@mantine/core"
import { Icon } from "@radix-ui/react-select"

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type SignInFormValues = z.infer<typeof signInSchema>

const SignIn = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { auth } = useSelector((state: any) => state.signIn)

  const [formData, setFormData] = useState<SignInFormValues>({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth) {
      navigate("/", { replace: true })
    }
  }, [auth, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          <div className="mb-8">
            <Title order={2}>Welcome back</Title>
            <Text>Sign in to continue learning</Text>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
              <Text className="text-red-600 text-sm">{error}</Text>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
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

            <SubmitButton
              loading={loading}
              fullWidth
              radius="lg"
              size="md"
              mt="xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </SubmitButton>

            <div className="text-center">
              <Text>Don't have an account?</Text>
            </div>

            <AppButton
              type="button"
              variant="outline"
              fullWidth
              radius="lg"
              onClick={() => navigate("/sign-up")}
            >
              Create Account
            </AppButton>
          </form>

          <Text className="text-center">
            Demo: demo@example.com / hashed_password_123
          </Text>
        </div>
      </div>
    </div>
  )
}

export default SignIn
