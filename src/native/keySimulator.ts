import koffi from "koffi";

// ============================================================
// Constants
// ============================================================

/** Virtual key code for 'V' key */
const kVK_ANSI_V = 0x09;

/** Command key modifier flag */
const kCGEventFlagMaskCommand = 0x00100000;

/** HID event tap location */
const kCGHIDEventTap = 0;

/** HID system state for event source */
const kCGEventSourceStateHIDSystemState = 1;

// ============================================================
// Type Definitions (Opaque Pointer Types)
// ============================================================

// Register opaque pointer types for Core Graphics
// These registrations make the type names available in function declarations
koffi.pointer("CGEventSourceRef", koffi.opaque());
koffi.pointer("CGEventRef", koffi.opaque());

// ============================================================
// Load Frameworks
// ============================================================

const CoreGraphics = koffi.load(
  "/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics",
);

const CoreFoundation = koffi.load(
  "/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation",
);

// ============================================================
// Function Bindings
// ============================================================

/**
 * CGEventSourceCreate - Creates an event source
 */
const CGEventSourceCreate = CoreGraphics.func(
  "CGEventSourceRef CGEventSourceCreate(int32_t stateID)",
);

/**
 * CGEventCreateKeyboardEvent - Creates a keyboard event
 */
const CGEventCreateKeyboardEvent = CoreGraphics.func(
  "CGEventRef CGEventCreateKeyboardEvent(CGEventSourceRef source, uint16_t virtualKey, bool keyDown)",
);

/**
 * CGEventSetFlags - Sets event flags (modifiers)
 */
const CGEventSetFlags = CoreGraphics.func(
  "void CGEventSetFlags(CGEventRef event, uint64_t flags)",
);

/**
 * CGEventPost - Posts an event to the event stream
 */
const CGEventPost = CoreGraphics.func(
  "void CGEventPost(uint32_t tap, CGEventRef event)",
);

/**
 * CFRelease - Releases a Core Foundation object
 */
const CFRelease = CoreFoundation.func("void CFRelease(void *cf)");

// ============================================================
// Public API
// ============================================================

/**
 * Simulates a Command+V (paste) keyboard shortcut.
 *
 * This function posts keyboard events directly to the system
 * using Core Graphics APIs.
 *
 * @throws Error if event creation fails
 */
export function simulateCommandV(): void {
  const source = CGEventSourceCreate(kCGEventSourceStateHIDSystemState);
  let keyDown = null;
  let keyUp = null;

  try {
    keyDown = CGEventCreateKeyboardEvent(source, kVK_ANSI_V, true);
    if (!keyDown) {
      throw new Error("Failed to create key down event");
    }

    keyUp = CGEventCreateKeyboardEvent(source, kVK_ANSI_V, false);
    if (!keyUp) {
      throw new Error("Failed to create key up event");
    }

    CGEventSetFlags(keyDown, kCGEventFlagMaskCommand);
    CGEventSetFlags(keyUp, kCGEventFlagMaskCommand);

    CGEventPost(kCGHIDEventTap, keyDown);
    CGEventPost(kCGHIDEventTap, keyUp);
  } finally {
    if (keyUp) CFRelease(keyUp);
    if (keyDown) CFRelease(keyDown);
    if (source) CFRelease(source);
  }
}
