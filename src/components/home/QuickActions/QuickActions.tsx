import Link from "next/link";
import { Stethoscope, Utensils, ShoppingBag, TrendingUp, FileText, Bell } from "lucide-react";

export function QuickActions() {
  const actions = [
    { icon: Stethoscope, label: "Doctor", link: "/doctor", bgColor: "bg-[#B5CA82]", ringColor: "ring-[#B5CA82]/20" },
    { icon: Utensils, label: "Meal", link: "/nutrition", bgColor: "bg-[#9FBEE4]", ringColor: "ring-[#9FBEE4]/20" },
    { icon: ShoppingBag, label: "Shop", link: "/shop", bgColor: "bg-[#C4B7D7]", ringColor: "ring-[#C4B7D7]/20" },
    { icon: TrendingUp, label: "Growth", link: "/growth", bgColor: "bg-[#8A84C8]", ringColor: "ring-[#8A84C8]/20" },
    // Desktop only icons
    { icon: FileText, label: "Records", link: "/profile", bgColor: "bg-[#F4A261]", ringColor: "ring-[#F4A261]/20", hiddenMobile: true },
    { icon: Bell, label: "Reminders", link: "/profile", bgColor: "bg-[#E76F51]", ringColor: "ring-[#E76F51]/20", hiddenMobile: true },
  ];

  return (
    <section className="w-full relative">
      <div className="bg-sky-100/50 rounded-lg p-5 md:p-6 border border-sky-100/50 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1 md:px-2">
          <h2 className="text-[17px] md:text-xl font-bold text-gray-900 tracking-tight">Quick Actions</h2>
        </div>

        {/* Icons Row */}
        <div className="flex justify-between md:justify-around items-center px-1 md:px-4">
          {actions.map((action, i) => (
            <Link 
              key={i} 
              href={action.link} 
              className={`flex flex-col items-center gap-3.5 group ${action.hiddenMobile ? 'hidden md:flex' : 'flex'}`}
            >
              <div className={`w-[3.25rem] h-[3.25rem] md:w-16 md:h-16 rounded-full flex items-center justify-center ${action.bgColor} text-white transition-transform duration-200 active:scale-95 group-hover:scale-105`}>
                <action.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
              </div>
              <span className="text-[12px] md:text-[13px] font-bold text-gray-900 leading-none">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
