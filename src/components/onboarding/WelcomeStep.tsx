import iconPath from "../../../assets/icon.png";
import { StepLayout } from "./StepLayout";

export const WelcomeStep = () => {
  return (
    <StepLayout
      variant="hero"
      icon={
        <img
          src={iconPath}
          alt="Politely"
          className="w-24 h-24 mb-6"
          draggable={false}
        />
      }
      title="Politely へようこそ"
      description="はじめに、いくつかの設定を行います。"
    />
  );
};
