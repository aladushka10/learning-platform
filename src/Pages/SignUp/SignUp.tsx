import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { signUpUser, clearError } from "../../store/signUpSlice"

const SignUp = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state: any) => state.signUp)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    firstName: "",
    lastName: "",
  })

  const [localError, setLocalError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setLocalError("")
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!formData.email || !formData.password || !formData.firstName) {
      setLocalError("Please fill in required fields")
      return
    }

    if (!formData.email.includes("@")) {
      setLocalError("Please enter a valid email")
      return
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters")
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setLocalError("Passwords do not match")
      return
    }

    dispatch(
      signUpUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
    )
  }

  useEffect(() => {
    if (success) {
      navigate("/", { replace: true })
    }
  }, [success, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/")}
              className="hover:opacity-75 transition-opacity"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-blue-100 mt-2">Join LearnLab and start learning</p>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{localError || error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  placeholder="John"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  placeholder="Doe"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <Input
                type="password"
                placeholder="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <Input
                type="password"
                placeholder="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-10"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/sign-in")}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing up, you agree to our Terms of Service
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp
