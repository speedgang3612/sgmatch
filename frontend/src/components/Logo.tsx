import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export default function Logo({ size = "md", linkTo = "/" }: LogoProps) {
  const sizes = {
    sm: { box: "w-7 h-7", icon: 14, text: "text-base" },
    md: { box: "w-8 h-8", icon: 16, text: "text-lg" },
    lg: { box: "w-10 h-10", icon: 20, text: "text-xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2">
      <div
        className={`${s.box} bg-[#E63946] rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Zap size={s.icon} className="text-white" />
      </div>
      <span className={`${s.text} font-bold text-white`}>
        SpeedGang<span className="text-[#E63946]"> Match</span>
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}