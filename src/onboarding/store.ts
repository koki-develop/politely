import Store from "electron-store";
import {
  DEFAULT_ONBOARDING_STATE,
  type OnboardingState,
  OnboardingStateSchema,
} from "../settings/schema";

// electron-store のスキーマ定義
const schema = {
  currentStep: {
    type: "string" as const,
    default: DEFAULT_ONBOARDING_STATE.currentStep,
  },
};

// シングルトンインスタンス
let store: Store<OnboardingState> | null = null;

function getOnboardingStore(): Store<OnboardingState> {
  if (!store) {
    store = new Store<OnboardingState>({
      name: "onboarding",
      schema,
      defaults: DEFAULT_ONBOARDING_STATE,
    });
  }
  return store;
}

// オンボーディング状態の取得
export function getOnboardingState(): OnboardingState {
  const s = getOnboardingStore();
  const raw = {
    currentStep: s.get("currentStep"),
  };

  const result = OnboardingStateSchema.safeParse(raw);
  if (!result.success) {
    console.warn(
      "[Onboarding] Invalid stored state, using defaults:",
      result.error.flatten(),
    );
    return DEFAULT_ONBOARDING_STATE;
  }
  return result.data;
}

// オンボーディング状態の更新
export function updateOnboardingState(
  state: Partial<OnboardingState>,
): { success: true } | { success: false; error: string } {
  const result = OnboardingStateSchema.partial().safeParse(state);
  if (!result.success) {
    const error = JSON.stringify(result.error.format());
    console.error("[Onboarding] Invalid state:", error);
    return { success: false, error };
  }

  const s = getOnboardingStore();
  const validated = result.data;

  if (validated.currentStep !== undefined) {
    s.set("currentStep", validated.currentStep);
  }

  return { success: true };
}

// オンボーディング完了
export function completeOnboarding(): void {
  const s = getOnboardingStore();
  s.set("currentStep", "completed");
}

// オンボーディング完了済みかどうか
export function isOnboardingCompleted(): boolean {
  return getOnboardingState().currentStep === "completed";
}
