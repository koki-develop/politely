import iconPath from "../../../assets/icon.png";

export const WelcomeStep = () => {
  return (
    <div className="animate-fade-in flex flex-col items-center">
      {/* Logo */}
      <img
        src={iconPath}
        alt="Politely"
        className="w-24 h-24 mb-6"
        draggable={false}
      />

      {/* Title */}
      <h1 className="text-[24px] font-bold text-zinc-100 tracking-[-0.03em] text-center mb-3">
        Politely へようこそ
      </h1>

      {/* Description */}
      <p className="text-[13px] text-zinc-500 text-center leading-relaxed max-w-[280px]">
        はじめに、いくつかの設定を行います。
      </p>
    </div>
  );
};
