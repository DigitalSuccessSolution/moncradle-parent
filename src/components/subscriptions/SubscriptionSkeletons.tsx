export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded-full w-2/3" />
          <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-5/6" />
      <div className="h-2.5 bg-gray-100 rounded-full w-full mt-2" />
      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-50">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export function PlanSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse flex flex-col gap-4">
      <div className="h-5 bg-gray-100 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      <div className="h-10 bg-gray-100 rounded-full w-1/3 mt-2" />
      <div className="space-y-3 mt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="h-3 bg-gray-100 rounded-full flex-1" />
          </div>
        ))}
      </div>
      <div className="h-11 bg-gray-100 rounded-xl mt-auto" />
    </div>
  );
}
