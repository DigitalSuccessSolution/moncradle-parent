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
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 border border-slate-100 shadow-xs w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-5 px-1 md:px-2">
          <h2 className="text-lg md:text-xl font-normal text-black tracking-tight">
            Quick Actions
          </h2>
          <span className="text-xs font-light text-gray-500 hidden sm:inline-block">
            Instant Access
          </span>
        </div>

        {/* Icons Row */}
        <div className="flex overflow-x-auto md:overflow-visible gap-5 sm:gap-6 md:gap-0 justify-start md:justify-around items-center px-1 md:px-2 pb-2 md:pb-0 no-scrollbar snap-x">
          {actions.map((action, i) => (
            <Link
              key={i}
              href={action.link}
              className={`flex flex-col items-center gap-2 group shrink-0 snap-center transition-all ${action.hiddenMobile ? 'hidden md:flex' : 'flex'}`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 group-hover:-translate-y-1.5 relative shadow-xs group-hover:shadow-sm border border-slate-100 ${action.bgColor}`}>
                <div className="relative w-[85%] h-[85%]">
                  <Image src={action.imageSrc} alt={action.label} fill className="object-contain" sizes="(max-width: 768px) 80px, 120px" />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs md:text-[13px] font-normal text-black group-hover:text-[var(--color-primary)] transition-colors leading-none">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
