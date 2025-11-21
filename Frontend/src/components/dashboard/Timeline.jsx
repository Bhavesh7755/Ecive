import React from "react";
import {
  Clock,
  Lightbulb,
  Truck,
  MessageCircle,
  CheckCircle,
  PackageCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export default function Timeline({ status }) {
  // Ordered steps (UI labels)
  const steps = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "aiSuggested", label: "AI Suggested", icon: Lightbulb },
    { key: "waitingRecycler", label: "Waiting Recycler", icon: Truck },
    { key: "negotiation", label: "Negotiation", icon: MessageCircle },
    { key: "finalized", label: "Final Price Locked", icon: CheckCircle },
    { key: "collected", label: "Collected", icon: PackageCheck },
    { key: "completed", label: "Completed", icon: ShieldCheck },
    { key: "cancelled", label: "Cancelled", icon: XCircle },
  ];

  // Find index of current status
  const currentStep = steps.findIndex((s) => s.key === status);

  return (
    <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4 text-lg">
        Order Timeline
      </h3>

      <div className="relative flex flex-col md:flex-row justify-between md:items-center gap-6 md:gap-4 px-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCancelled = status === "cancelled";

          return (
            <div
              key={step.key}
              className="flex md:flex-col items-start md:items-center gap-3 relative"
            >
              {/* Line before icon (desktop only) */}
              {index > 0 && (
                <div
                  className={`hidden md:block absolute left-[-50%] top-[18px] h-[3px] w-full ${
                    isCancelled
                      ? "bg-red-300"
                      : isActive
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                ></div>
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all 
                ${
                  isCancelled
                    ? "border-red-500 bg-red-100 text-red-600"
                    : isActive
                    ? "border-green-600 bg-green-50 text-green-600"
                    : "border-gray-300 bg-gray-100 text-gray-400"
                }`}
              >
                <Icon size={20} />
              </div>

              {/* Label */}
              <div className="flex flex-col">
                <p
                  className={`text-sm font-medium ${
                    isCancelled
                      ? "text-red-600"
                      : isActive
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400">({step.key})</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}