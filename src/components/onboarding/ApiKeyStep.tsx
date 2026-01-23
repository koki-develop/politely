import { IconKey } from "@tabler/icons-react";
import { ApiKeyInput } from "../ApiKeyInput";
import { StepCard, StepIcon, StepLayout } from "./StepLayout";

type ApiKeyStepProps = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

export const ApiKeyStep = ({ value, onChange, error }: ApiKeyStepProps) => {
  return (
    <StepLayout
      variant="form"
      icon={
        <StepIcon>
          <IconKey size={28} className="text-violet-400" stroke={1.5} />
        </StepIcon>
      }
      title="OpenAI API キーを設定"
      description={
        <>
          音声認識と丁寧語変換に OpenAI の API を使用します。
          <br />
          API キーは安全にローカルに保存されます。
        </>
      }
      helperText={
        <>
          API キーは{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/80 hover:text-violet-400 transition-colors"
          >
            OpenAI のダッシュボード
          </a>{" "}
          から取得できます
        </>
      }
    >
      <StepCard error={error}>
        <ApiKeyInput value={value} onChange={onChange} />
      </StepCard>
    </StepLayout>
  );
};
