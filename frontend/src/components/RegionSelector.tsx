import { useState } from "react";
import { ChevronRight, MapPin, ArrowLeft } from "lucide-react";
import { cities, type City } from "@/data/regions";

interface RegionSelectorProps {
  onSelect: (city: string, district: string) => void;
  selectedCity: string;
  selectedDistrict: string;
  onReset: () => void;
}

export default function RegionSelector({
  onSelect,
  selectedCity,
  selectedDistrict,
  onReset,
}: RegionSelectorProps) {
  const [step, setStep] = useState<"city" | "district">(
    selectedCity ? "district" : "city"
  );
  const [currentCity, setCurrentCity] = useState<City | null>(
    selectedCity ? cities.find((c) => c.name === selectedCity) || null : null
  );

  const handleCityClick = (city: City) => {
    setCurrentCity(city);
    setStep("district");
  };

  const handleDistrictClick = (districtName: string) => {
    if (currentCity) {
      onSelect(currentCity.name, districtName);
    }
  };

  const handleBack = () => {
    if (selectedCity) {
      onReset();
    }
    setCurrentCity(null);
    setStep("city");
  };

  // Already selected — show breadcrumb
  if (selectedCity && selectedDistrict) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-[#E63946]" />
            <span className="text-[#9CA3AF]">{selectedCity}</span>
            <ChevronRight size={14} className="text-[#6B7280]" />
            <span className="text-white font-bold">{selectedDistrict}</span>
          </div>
          <button
            onClick={handleBack}
            className="text-[#E63946] text-sm font-medium hover:underline"
          >
            지역 변경
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {step === "district" && (
          <button
            onClick={handleBack}
            className="text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-[#E63946]" />
          <h3 className="text-lg font-bold">
            {step === "city" ? "지역을 선택하세요" : currentCity?.name}
          </h3>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5 text-xs text-[#6B7280]">
        <span
          className={
            step === "city" ? "text-[#E63946] font-bold" : "text-[#9CA3AF]"
          }
        >
          시/도 선택
        </span>
        <ChevronRight size={12} />
        <span
          className={
            step === "district" ? "text-[#E63946] font-bold" : "text-[#6B7280]"
          }
        >
          구/군 선택
        </span>
      </div>

      {/* City list */}
      {step === "city" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cities.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCityClick(city)}
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-left hover:border-[#E63946]/50 hover:bg-[#E63946]/5 transition-all duration-200 group"
            >
              <p className="font-bold text-sm group-hover:text-[#E63946] transition-colors">
                {city.name}
              </p>
              <p className="text-[#6B7280] text-xs mt-1">
                {city.regions.length}개 구/군
              </p>
            </button>
          ))}
        </div>
      )}

      {/* District list */}
      {step === "district" && currentCity && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {currentCity.regions.map((region) => (
            <button
              key={region.name}
              onClick={() => handleDistrictClick(region.name)}
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 text-left hover:border-[#E63946]/50 hover:bg-[#E63946]/5 transition-all duration-200 group"
            >
              <p className="font-bold text-sm group-hover:text-[#E63946] transition-colors">
                {region.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}