import { QuickActionType } from "@/constants";
import { Card } from "@/components/ui/card";

function ActionCard({
  action,
  onClick,
}: {
  action: QuickActionType;
  onClick?: () => void;
}) {
  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      iconBg: "bg-emerald-100",
      hover: "hover:border-emerald-200",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      iconBg: "bg-purple-100",
      hover: "hover:border-purple-200",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
      hover: "hover:border-blue-200",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      iconBg: "bg-amber-100",
      hover: "hover:border-amber-200",
    },
  };

  const classes =
    colorClasses[action.color as keyof typeof colorClasses] ??
    colorClasses["blue"];

  return (
    <Card
      className={`${classes.bg} border-gray-100 ${classes.hover} transition-all duration-300 hover:shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex flex-col items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${classes.iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            <action.icon className={`h-6 w-6 ${classes.icon}`} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xl mb-1 transition-colors duration-300 hover:text-gray-900">
              {action.title}
            </h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ActionCard;
