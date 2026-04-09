import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export default function Logo({ size = "md", linkTo = "/" }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg", bolt: 14 },
    md: { icon: 36, text: "text-xl", bolt: 18 },
    lg: { icon: 44, text: "text-2xl", bolt: 22 },
  };

  const s = sizes[size];

  const logoIcon = (
    <div
      className="relative flex items-center justify-center rounded-xl overflow-hidden"
      style={{ width: s.icon, height: s.icon }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E63946] to-[#C62828]" />
      {/* SG monogram with bolt */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: s.bolt + 8, height: s.bolt + 8 }}
        className="relative z-10"
      >
        {/* S shape */}
        <path
          d="M12 12C12 12 16 8 22 10C28 12 26 18 20 20C14 22 12 28 18 30C24 32 28 28 28 28"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lightning bolt overlay */}
        <path
          d="M22 6L16 20H24L18 34"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );

  const content = (
    <div className="flex items-center gap-2">
      {logoIcon}
      <div className="flex flex-col leading-none">
        <span className={`${s.text} font-extrabold tracking-tight text-white`}>
          Speed<span className="text-[#E63946]">Gang</span>
        </span>
        <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-[#E63946]/80">
          MATCH
        </span>
      </div>
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