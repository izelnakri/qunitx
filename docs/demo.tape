# QUnitX demo — terminal portion of the composite GIF
# Run: nix run nixpkgs#vhs -- docs/demo.tape
# Output: docs/terminal.gif  (composited into docs/demo.gif by make-demo-gif.sh)
#
# bash is used because it has interactive_comments on by default.
# One mid-tape hidden section swaps demo-math-test.ts with the buggy version
# and schedules a background restore so watch mode starts red then turns green.
# TypingSpeed is set to 1ms inside the hidden section so it completes instantly
# (otherwise the 190-char commands would eat ~7s of invisible recording time).
# Ctrl+L after Show clears scrollback before the next visible command.

Output docs/terminal.gif

Set Shell "bash"
Set FontSize 14
Set Width 700
Set Height 680
Set Theme "Dracula"
Set Padding 20
Set TypingSpeed 35ms
Set PlaybackSpeed 1.0

# --- Show the test file ---
Type "bat --paging=never docs/demo-math-test.ts"
Enter
Sleep 1500ms

# --- Node.js: zero config, passes on the clean file ---
Type "# Node.js — zero config, built-in runner"
Enter
Sleep 200ms
Type "node --test docs/demo-math-test.ts"
Enter
Sleep 3000ms

# --- Swap to the buggy file and schedule the fix (hidden, instant typing) ---
Hide
Set TypingSpeed 1ms
Type "cp docs/demo-math-test.ts docs/demo-math-test-backup.ts && cp docs/demo-math-test-buggy.ts docs/demo-math-test.ts"
Enter
Sleep 200ms
Type "(sleep 6 && cp docs/demo-math-test-backup.ts docs/demo-math-test.ts) & disown"
Enter
Sleep 200ms
Set TypingSpeed 35ms
Show
Ctrl+L
Sleep 200ms

# --- Watch mode: starts red (buggy file), turns green when file is "saved" ---
# Timing: disown runs ~9s into recording; sleep 6 fires restore at ~15s.
# Watch starts at ~12.5s so restore fires ~2.5s into watch mode (after first
# failing run finishes), triggering a rerun that turns GREEN ~4s in.
# Sleep 8000ms gives ~4s of visible green before Ctrl+C at ~8s into watch.
Type "# Watch mode — reruns on every file save"
Enter
Sleep 200ms
Type "node --test --watch docs/demo-math-test.ts"
Enter
Sleep 8000ms
Ctrl+C
Sleep 500ms

# --- Deno: same file, same results ---
Type "# Deno — same file, same results"
Enter
Sleep 200ms
Type "deno test --allow-read --allow-env docs/demo-math-test.ts"
Enter
Sleep 2500ms

# --- qunitx: browser runner (the finale) ---
Type "# Browser UI: qunitx docs/demo-math-test.ts --debug"
Enter
Sleep 200ms
Type "npx qunitx docs/demo-math-test.ts"
Enter
Sleep 2500ms
