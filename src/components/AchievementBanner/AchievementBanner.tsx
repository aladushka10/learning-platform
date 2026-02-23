import { useEffect } from "react"
import styles from "./AchievementBanner.module.scss"
import { renderAchievementIcon } from "../../utils/achievementIcons"
import { IconX } from "@tabler/icons-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon?: string
}

interface Props {
  achievement: Achievement | null
  onClose: () => void
}

const AchievementBanner = ({ achievement, onClose }: Props) => {
  useEffect(() => {
    if (!achievement) return

    const timer = setTimeout(() => {
      onClose()
    }, 6000)

    return () => clearTimeout(timer)
  }, [achievement, onClose])

  if (!achievement) return null

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {renderAchievementIcon(achievement.icon, true, 32)}
        </div>

        <div className={styles.text}>
          <div className={styles.title}>
            <p>Достижение получено!</p>
          </div>
          <div className={styles.name}>
            <p>{achievement.name}</p>
          </div>
          <div className={styles.description}>
            <p>{achievement.description}</p>
          </div>
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          <IconX size={14} />
        </button>
      </div>
    </div>
  )
}

export default AchievementBanner
