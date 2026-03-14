# QUnitX demo — terminal portion of the composite GIF
# Run: nix run nixpkgs#vhs -- docs/demo.tape
# Output: docs/terminal.gif  (composited into docs/demo.gif by make-demo-gif.sh)

Output docs/terminal.gif

Set Shell "zsh"
Set FontSize 14
Set Width 700
Set Height 680
Set Theme "Dracula"
Set Padding 20
Set TypingSpeed 55ms
Set PlaybackSpeed 0.85

# --- Show the test file ---
Type "cat docs/demo-math-test.js"
Enter
Sleep 3500ms

# --- Run in Node.js ---
Type "# Node.js — zero config, built-in test runner"
Enter
Sleep 400ms
Type "node --test docs/demo-math-test.js"
Enter
Sleep 4500ms

# --- Watch mode hint ---
Type "# Watch mode reruns on every file save"
Enter
Sleep 300ms
Type "node --test --watch docs/demo-math-test.js"
Enter
Sleep 2000ms
Ctrl+C
Sleep 400ms

# --- Run in Deno ---
Type "# Deno — same file, same results"
Enter
Sleep 400ms
Type "deno test --allow-read --allow-env docs/demo-math-test.js"
Enter
Sleep 4500ms

# --- Browser hint ---
Type "# Browser: qunitx some-test.js --debug"
Enter
Sleep 300ms
Type "# opens the QUnit UI shown on the right →"
Enter
Sleep 3000ms
