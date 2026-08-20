import Link from "next/link";
import Image from "next/image";

export function QuickActions() {
  const actions: { imageSrc: string; label: string; link: string; bgColor: string; hiddenMobile?: boolean }[] = [
    { imageSrc: "/images/icons/doctor.png", label: "Doctor", link: "/doctor", bgColor: "bg-[#D8F2E3]" },
    { imageSrc: "/images/icons/meal.png", label: "Meal", link: "/nutrition", bgColor: "bg-[#D5EAF7]" },
    { imageSrc: "/images/icons/shop.png", label: "Shop", link: "/shop", bgColor: "bg-[#E6D7F9]" },
    { imageSrc: "/images/icons/growth.png", label: "Growth", link: "/growth", bgColor: "bg-[#D9CCFA]" },
    { imageSrc: "/images/icons/records.png", label: "Tracker", link: "/tracking", bgColor: "bg-[#FCE2C2]" },
    // Desktop only icons
    { imageSrc: "/images/icons/records.png", label: "Records", link: "/health-records", bgColor: "bg-[#FCE2C2]", hiddenMobile: true },
    { imageSrc: "/images/icons/reminders.png", label: "Reminders", link: "/notifications", bgColor: "bg-[#FAC7BA]", hiddenMobile: true },
  ];

  return (
    <section className="w-full relative">
      <div className="bg-sky-100/50 rounded-lg p-5 md:p-6 border border-sky-100/50 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1 md:px-2">
          <h2 className="text-[17px] md:text-xl font-semibold text-gray-900 tracking-tight">Quick Actions</h2>
        </div>

        {/* Icons Row */}
        <div className="flex overflow-x-auto md:overflow-visible gap-6 md:gap-0 justify-start md:justify-around items-center px-1 md:px-4 pb-2 md:pb-0 no-scrollbar snap-x">
          {actions.map((action, i) => (
            <Link 
              key={i} 
              href={action.link} 
              className={`flex flex-col items-center gap-3.5 group shrink-0 snap-center ${action.hiddenMobile ? 'hidden md:flex' : 'flex'}`}
            >
              <div className={`w-16 h-16 md:w-[88px] md:h-[88px] rounded-full flex items-center justify-center transition-transform duration-200 active:scale-95 group-hover:-translate-y-1 relative shadow-sm border border-black/5 ${action.bgColor}`}>
                <div className="relative w-[95%] h-[95%]">
                  <Image src={action.imageSrc} alt={action.label} fill className="object-contain" sizes="(max-width: 768px) 90px, 150px" />
                </div>
              </div>
              <span className="text-[12px] md:text-[13px] font-semibold text-gray-900 leading-none">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
