import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ArrowLeft } from "lucide-react"
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

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
  //     <Card className="w-full max-w-md border-0 shadow-xl">
  //       <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
  //         <div className="flex items-center gap-3 mb-4">
  //           <button
  //             onClick={() => navigate("/")}
  //             className="hover:opacity-75 transition-opacity"
  //           >
  //             <ArrowLeft size={20} />
  //           </button>
  //         </div>
  //         <h2 className="text-3xl font-bold">Welcome Back</h2>
  //         <p className="text-blue-100 mt-2">Sign in to your account</p>
  //       </CardHeader>

  //       <CardContent className="p-8">
  //         <form onSubmit={handleSubmit} className="space-y-5">
  //           {error && (
  //             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
  //               <p className="text-red-700 text-sm">{error}</p>
  //             </div>
  //           )}

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Email
  //             </label>
  //             <Input
  //               type="email"
  //               placeholder="your@email.com"
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //               className="w-full"
  //             />
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Password
  //             </label>
  //             <Input
  //               type="password"
  //               placeholder="••••••••"
  //               value={password}
  //               onChange={(e) => setPassword(e.target.value)}
  //               className="w-full"
  //             />
  //           </div>

  //           <div className="flex items-center justify-between text-sm">
  //             <button
  //               type="button"
  //               onClick={() => navigate("/")}
  //               className="text-gray-600 hover:text-gray-900"
  //             >
  //               Forgot password?
  //             </button>
  //           </div>

  //           <Button
  //             type="submit"
  //             disabled={loading}
  //             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-10"
  //           >
  //             {loading ? "Signing in..." : "Sign In"}
  //           </Button>

  //           <div className="relative">
  //             <div className="absolute inset-0 flex items-center">
  //               <div className="w-full border-t border-gray-300"></div>
  //             </div>
  //             <div className="relative flex justify-center text-sm">
  //               <span className="px-2 bg-white text-gray-500">
  //                 Don't have an account?
  //               </span>
  //             </div>
  //           </div>

  //           <Button
  //             type="button"
  //             variant="outline"
  //             onClick={() => navigate("/sign-up")}
  //             className="w-full"
  //           >
  //             Create Account
  //           </Button>
  //         </form>

  //         <p className="text-xs text-gray-500 text-center mt-6">
  //           Demo: `demo@example.com` / `hashed_password_123`
  //         </p>
  //       </CardContent>
  //     </Card>
  //   </div>
  // )
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          {/* Back button */}
          {/* <button
            onClick={() => navigate("/")}
            className="mb-6 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button> */}

          {/* Title */}
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
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <AppButton
              type="submit"
              loading={loading}
              fullWidth
              radius="lg"
              size="md"
            >
              {loading ? "Signing in..." : "Sign In"}
            </AppButton>

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
