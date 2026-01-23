import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[Onboarding] React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-zinc-900 flex items-center justify-center">
          <div className="text-center px-8 max-w-sm">
            <p className="text-red-400 text-[15px] font-medium mb-2">
              エラーが発生しました
            </p>
            <p className="text-zinc-500 text-[12px] mb-4">
              {this.state.error?.message ?? "予期しないエラーが発生しました。"}
            </p>
            <button
              type="button"
              onClick={() => window.close()}
              className="text-[13px] text-zinc-400 hover:text-zinc-300 transition-colors px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
