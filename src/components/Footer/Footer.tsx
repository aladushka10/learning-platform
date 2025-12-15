import { HelpCircle, Mail, FileText } from "lucide-react"
import style from "./Footer.module.scss"

export function Footer() {
  const links = [
    { icon: HelpCircle, label: "Справка", href: "#" },
    { icon: FileText, label: "Частые вопросы", href: "#" },
    { icon: Mail, label: "Контакты", href: "#" },
  ]

  return (
    <footer
      className={`${style.footer} bg-white border-t border-gray-200 mt-auto`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className={`${style.links}`}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <p className={`${style.copyright}`}>
            © 2025 LearnLab. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
