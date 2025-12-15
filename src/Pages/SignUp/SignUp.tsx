import { Link, useNavigate } from "react-router-dom"
import Input from "../../Components/Input/Input"
import style from "./SignUp.module.scss"
import { useState, useEffect } from "react"
import Title from "../../Components/Title/Title"
import { useDispatch, useSelector } from "react-redux"
import { signUpUser, clearError } from "../../store/signUpSlice"

const SignUp = () => {
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    passwordConfirm: "",
  })

  const [localError, setLocalError] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error, success } = useSelector((state: any) => state.signUp)

  const formHandler = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !registrationData.email ||
      !registrationData.password ||
      !registrationData.firstName
    ) {
      setLocalError("Please fill in required fields")
      return
    }

    if (registrationData.password !== registrationData.passwordConfirm) {
      setLocalError("Passwords do not match")
      return
    }

    if (!registrationData.email.includes("@")) {
      setLocalError("Please enter a valid email")
      return
    }

    let formattedDateOfBirth = registrationData.dateOfBirth
    if (formattedDateOfBirth) {
      const parts = formattedDateOfBirth.split("-")
      if (parts.length === 3 && parts[2].length === 4) {
        formattedDateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    }

    dispatch(
      signUpUser({
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName || "",
        phone: registrationData.phone || "",
        dateOfBirth: formattedDateOfBirth || null,
      })
    )
  }

  const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setLocalError("")
    if (error) {
      dispatch(clearError())
    }
  }

  useEffect(() => {
    if (success) {
      navigate("/sign-in", {
        state: { message: "Registration successful! Please sign in." },
      })
    }
  }, [success, navigate])

  return (
    <div className={style.SignUp}>
      <div className={style.container}>
        <div className={style.SignUpWrap}>
          <Link className={style.backHomeBtn} to={"/"}>
            Back to Home
          </Link>
          <Title title={"Sign Up"} />

          {/* Отображение ошибок */}
          {(error || localError) && (
            <div
              className={style.errorMessage}
              style={{ color: "red", marginBottom: "15px" }}
            >
              {error || localError}
            </div>
          )}

          {success && (
            <div
              className={style.successMessage}
              style={{ color: "green", marginBottom: "15px" }}
            >
              Registration successful! Redirecting...
            </div>
          )}

          <div className={style.SignUpFormBorder}>
            <form className={style.SignUpForm} onSubmit={formHandler}>
              <Input
                name={"firstName"}
                title={"First Name*"}
                type={"text"}
                placeholder="Your first name"
                inputEvent={inputHandler}
                value={registrationData.firstName}
                required
              />
              <Input
                name={"lastName"}
                title={"Last Name"}
                type={"text"}
                placeholder="Your last name (optional)"
                inputEvent={inputHandler}
                value={registrationData.lastName}
              />
              <Input
                name={"email"}
                title={"Email*"}
                type={"email"}
                placeholder="Your email"
                inputEvent={inputHandler}
                value={registrationData.email}
                required
              />
              <Input
                name={"phone"}
                title={"Phone"}
                type={"tel"}
                placeholder="Your phone (optional)"
                inputEvent={inputHandler}
                value={registrationData.phone}
              />
              <Input
                name={"dateOfBirth"}
                title={"Date of Birth"}
                type={"text"}
                placeholder="DD-MM-YYYY (optional)"
                inputEvent={inputHandler}
                value={registrationData.dateOfBirth}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                Please use format: DD-MM-YYYY
              </div>

              <Input
                name={"password"}
                title={"Password*"}
                type={"password"}
                placeholder="Your password"
                inputEvent={inputHandler}
                value={registrationData.password}
                required
              />
              <Input
                name={"passwordConfirm"}
                title={"Confirm Password*"}
                type={"password"}
                placeholder="Confirm password"
                inputEvent={inputHandler}
                value={registrationData.passwordConfirm}
                required
              />
              <button
                type="submit"
                className={style.SignUpBtn}
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign Up"}
              </button>

              <div className={style.withoutAccWrap}>
                <span>Already have an account?</span>
                <Link to={"/sign-in"} className={style.signInBtn}>
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SignUp
