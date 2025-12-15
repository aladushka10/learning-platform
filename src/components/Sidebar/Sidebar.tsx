import { BookOpen, Target, TrendingUp, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { icon: Target, label: 'Задачи', active: true },
  { icon: BookOpen, label: 'Теория', active: false },
  { icon: TrendingUp, label: 'Прогресс', active: false },
  { icon: Settings, label: 'Настройки', active: false },
];

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${collapsed ? 'px-3' : 'px-4'} ${
                  item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
        </div>

        <div className="p-2 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-gray-600"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Свернуть</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}