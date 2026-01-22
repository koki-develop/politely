/**
 * Permission service for checking and requesting macOS permissions.
 */

import { shell, systemPreferences } from "electron";

export type PermissionStatus =
  | "granted"
  | "denied"
  | "not-determined"
  | "unknown";

export type PermissionsState = {
  accessibility: PermissionStatus;
  microphone: PermissionStatus;
};

/**
 * Check accessibility permission status.
 * @param prompt - If true, shows system dialog to request permission
 */
export function checkAccessibilityPermission(prompt = false): PermissionStatus {
  if (process.platform !== "darwin") return "granted";
  const isTrusted = systemPreferences.isTrustedAccessibilityClient(prompt);
  return isTrusted ? "granted" : "denied";
}

/**
 * Check microphone permission status.
 */
export function checkMicrophonePermission(): PermissionStatus {
  if (process.platform !== "darwin") return "granted";
  const status = systemPreferences.getMediaAccessStatus("microphone");
  // Map "restricted" to "denied" for simpler handling
  if (status === "restricted") return "denied";
  return status as PermissionStatus;
}

/**
 * Check all required permissions.
 */
export function checkAllPermissions(): PermissionsState {
  return {
    accessibility: checkAccessibilityPermission(false),
    microphone: checkMicrophonePermission(),
  };
}

/**
 * Request microphone permission. Shows system dialog on first call.
 * Returns true if permission was granted.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (process.platform !== "darwin") return true;
  return await systemPreferences.askForMediaAccess("microphone");
}

/**
 * Open macOS System Settings to Accessibility privacy settings.
 */
export function openAccessibilitySettings(): void {
  shell.openExternal(
    "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
  );
}

/**
 * Open macOS System Settings to Microphone privacy settings.
 */
export function openMicrophoneSettings(): void {
  shell.openExternal(
    "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
  );
}
