import { BarChart3, FlaskConical, FileText, Waves, Brain, Clock } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analysis', label: 'Analysis', icon: FlaskConical },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'training', label: 'Training', icon: Brain },
    { id: 'contracts', label: 'Smart Contracts', icon: FileText },
  ];

  return (
    <div className="w-52 bg-gradient-to-b from-gray-800 to-gray-900 h-screen flex flex-col border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">SamudraSetu</span>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
