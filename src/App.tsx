import { VoiceInput } from "./components/VoiceInput";

export const App = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Politely</h1>

      <VoiceInput />
    </div>
  );
};
