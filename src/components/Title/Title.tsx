import { ReactNode } from "react"
import style from "../Title/Title.module.scss"

interface IProps {
  title?: string
  children?: ReactNode
}

const Title = ({ title, children }: IProps) => {
  if (title === undefined) {
    return <h1>{children}</h1>
  }
  return <h1 className={style.title}>{title}</h1>
}
export default Title
