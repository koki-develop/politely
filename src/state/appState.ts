/**
 * Centralized state management for the application.
 * Main Process is the Single Source of Truth.
 */

export type AppState = "idle" | "recording" | "transcribing" | "error";

type StateTransition = {
  from: AppState | AppState[];
  to: AppState;
};

// Valid state transitions
const VALID_TRANSITIONS: StateTransition[] = [
  { from: "idle", to: "recording" },
  { from: "idle", to: "error" }, // Permission error
  { from: "recording", to: "transcribing" },
  { from: "recording", to: "idle" }, // Cancel
  { from: "transcribing", to: "idle" },
  { from: "transcribing", to: "error" },
  { from: "error", to: "idle" }, // Dismiss
  { from: "error", to: "recording" }, // Retry
];

type StateChangeListener = (state: AppState, error?: string | null) => void;

export class AppStateManager {
  private state: AppState = "idle";
  private error: string | null = null;
  private listeners: Set<StateChangeListener> = new Set();

  getState(): AppState {
    return this.state;
  }

  getError(): string | null {
    return this.error;
  }

  /**
   * Attempt to transition to a new state.
   * Returns true if transition was valid and performed, false otherwise.
   */
  transition(to: AppState, error?: string | null): boolean {
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
    this.error = to === "error" ? (error ?? null) : null;
    this.notifyListeners();
    return true;
  }

  /**
   * Force set state (for initialization or recovery).
   * Use sparingly - prefer transition() for normal operations.
   */
  forceState(state: AppState, error?: string | null): void {
    console.log(`[AppState] Force set: ${this.state} -> ${state}`);
    this.state = state;
    this.error = state === "error" ? (error ?? null) : null;
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
      listener(this.state, this.error);
    }
  }
}

// Singleton instance
export const appStateManager = new AppStateManager();
