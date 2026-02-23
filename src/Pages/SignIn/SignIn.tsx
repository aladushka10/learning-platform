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
import { Loader } from "@mantine/core"
import { Icon } from "@radix-ui/react-select"

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const SignIn = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { auth } = useSelector((state: any) => state.signIn)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const parsed = signInSchema.safeParse({ email, password })
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Invalid form")
        return
      }

      await (dispatch as any)(
        signInUser({
          email,
          password,
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
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in to continue learning
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <MTextInput
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              radius="lg"
              size="md"
            />

            <MTextInput
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
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

            <div className="text-center text-sm text-gray-500">
              Don't have an account?
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

          <p className="text-xs text-gray-400 text-center mt-8">
            Demo: demo@example.com / hashed_password_123
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
