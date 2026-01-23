import { IconSparkles } from "@tabler/icons-react";
import {
  POLITENESS_LEVEL_LABELS,
  POLITENESS_LEVELS,
  type PolitenessLevel,
} from "../../settings/schema";
import { ModelSelector } from "../ModelSelector";
import { StepCard, StepIcon, StepLayout } from "./StepLayout";

type PolitenessLevelStepProps = {
  value: PolitenessLevel;
  onChange: (value: PolitenessLevel) => void;
};

export const PolitenessLevelStep = ({
  value,
  onChange,
}: PolitenessLevelStepProps) => {
  return (
    <StepLayout
      variant="form"
      icon={
        <StepIcon>
          <IconSparkles size={28} className="text-violet-400" stroke={1.5} />
        </StepIcon>
      }
      title="丁寧さを設定"
      description={
        <>
          音声入力したテキストをどの程度
          <br />
          丁寧な文章に変換するかを選べます。
        </>
      }
      helperText="設定は後から変更できます"
    >
      <StepCard>
        <ModelSelector
          label="丁寧さ"
          description="テキストをどの程度丁寧に変換するか"
          value={value}
          options={POLITENESS_LEVELS}
          labels={POLITENESS_LEVEL_LABELS}
          onChange={onChange}
        />
      </StepCard>
    </StepLayout>
  );
};
