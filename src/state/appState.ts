/**
 * Centralized state management for the application.
 * Main Process is the Single Source of Truth.
 */

import type { AppError } from "../types/electron";

export type AppState =
  | "idle"
  | "preparing"
  | "recording"
  | "transcribing"
  | "converting"
  | "error";

type StateTransition = {
  from: AppState | AppState[];
  to: AppState;
};

// Valid state transitions
const VALID_TRANSITIONS: StateTransition[] = [
  // idle transitions
  { from: "idle", to: "preparing" },
  { from: "idle", to: "error" }, // Permission error

  // preparing transitions
  { from: "preparing", to: "recording" },
  { from: "preparing", to: "error" },
  { from: "preparing", to: "idle" }, // Cancel

  // recording transitions
  { from: "recording", to: "transcribing" },
  { from: "recording", to: "idle" }, // Cancel

  // transcribing transitions
  { from: "transcribing", to: "converting" },
  { from: "transcribing", to: "idle" },
  { from: "transcribing", to: "error" },

  // converting transitions
  { from: "converting", to: "idle" },
  { from: "converting", to: "error" },

  // error transitions
  { from: "error", to: "idle" }, // Dismiss
  { from: "error", to: "preparing" }, // Retry
];

/**
 * 状態変更リスナーの型（AppError と rawText に対応）
 */
type StateChangeListener = (
  state: AppState,
  error?: AppError | null,
  rawText?: string | null,
) => void;

export class AppStateManager {
  private state: AppState = "idle";
  private error: AppError | null = null;
  private rawText: string | null = null;
  private listeners: Set<StateChangeListener> = new Set();

  getState(): AppState {
    return this.state;
  }

  getError(): AppError | null {
    return this.error;
  }

  getRawText(): string | null {
    return this.rawText;
  }

  /**
   * 状態遷移（オーバーロード）
   * 状態ごとに適切なパラメータ型を強制
   */
  transition(to: "error", error: AppError): boolean;
  transition(to: "converting", rawText: string): boolean;
  transition(to: Exclude<AppState, "error" | "converting">): boolean;
  transition(to: AppState, data?: AppError | string): boolean {
    const isValid = VALID_TRANSITIONS.some((t) => {
      const fromMatch = Array.isArray(t.from)
        ? t.from.includes(this.state)
        : t.from === this.state;
      return fromMatch && t.to === to;
    });

    if (!isValid) {
      console.warn(`[AppState] Invalid transition: ${this.state} -> ${to}`);
      return false;
    }

    console.log(`[AppState] Transition: ${this.state} -> ${to}`);
    this.state = to;

    // 状態に応じてデータを保存
    if (to === "converting" && typeof data === "string") {
      this.rawText = data;
      this.error = null;
    } else if (to === "error" && typeof data === "object" && data !== null) {
      this.error = data;
      this.rawText = null;
    } else {
      this.error = null;
      this.rawText = null;
    }

    this.notifyListeners();
    return true;
  }

  /**
   * Force set state (for initialization or recovery).
   * Use sparingly - prefer transition() for normal operations.
   */
  forceState(state: AppState, error?: AppError | null): void {
    console.log(`[AppState] Force set: ${this.state} -> ${state}`);
    this.state = state;
    this.error = state === "error" ? (error ?? null) : null;
    this.rawText = null;
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state, this.error, this.rawText);
    }
  }
}

// Singleton instance
export const appStateManager = new AppStateManager();
