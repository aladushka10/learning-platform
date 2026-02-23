import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { IconArrowLeft } from "@tabler/icons-react"
import { signUpUser, clearError } from "../../store/signUpSlice"
import { z } from "zod"
import { SubmitButton } from "../../components/SubmitButton/SubmitButton"
import { AppButton } from "../../components/AppButton/AppButton"
import { MTextInput } from "../../components/MTextInput/MTextInput"

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="mb-6 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <IconArrowLeft size={20} />
          </button>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Create account
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Join the platform and start learning
            </p>
          </div>

          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
              <p className="text-red-600 text-sm">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name grid */}
            <div className="grid grid-cols-2 gap-6">
              <MTextInput
                label="First Name"
                placeholder="John"
                name="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "firstName",
                      value: e.currentTarget.value,
                    },
                  })
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
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "lastName",
                      value: e.currentTarget.value,
                    },
                  })
                }
                radius="lg"
              />
            </div>

            <MTextInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              name="email"
              value={formData.email}
              onChange={(e) =>
                handleChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "email",
                    value: e.currentTarget.value,
                  },
                })
              }
              required
              radius="lg"
            />

            <div>
              <MTextInput
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "password",
                      value: e.currentTarget.value,
                    },
                  })
                }
                required
                radius="lg"
              />
              <p className="text-xs text-gray-400 mt-2">Minimum 6 characters</p>
            </div>

            <MTextInput
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={(e) =>
                handleChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "passwordConfirm",
                    value: e.currentTarget.value,
                  },
                })
              }
              required
              radius="lg"
            />

            <SubmitButton
              loading={loading}
              fullWidth
              radius="lg"
              size="md"
              mt="xl"
            >
              {loading ? "Creating account..." : "Create Account"}
            </SubmitButton>

            <div className="text-center text-sm text-gray-500">
              Already have an account?
            </div>

            <AppButton
              type="button"
              variant="outline"
              fullWidth
              radius="lg"
              onClick={() => navigate("/sign-in")}
            >
              Sign In
            </AppButton>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
