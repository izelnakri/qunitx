{
  description = "QUnitX — universal JS/TS test framework for Node.js, Deno and browser";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs = { self, nixpkgs }:
    let
      systems      = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      pkgsFor      = system: nixpkgs.legacyPackages.${system};
    in {

      # ── Dev shell ──────────────────────────────────────────────────────────────
      # $ nix develop
      devShells = forAllSystems (system:
        let pkgs = pkgsFor system; in {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_24   # runtime + npm
              pkgs.deno        # deno tests / bench / lint
              pkgs.git-cliff   # changelog generation
              pkgs.chromium    # browser tests (CHROME_BIN set below)
            ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
              pkgs.vhs         # terminal GIF recording (docs/demo.tape)
              pkgs.bat         # syntax-highlighted cat for VHS scripts
              pkgs.wf-recorder # screen recorder used by make demo
              pkgs.ffmpeg      # GIF assembly pipeline
            ];

            shellHook = ''
              export CHROME_BIN="${pkgs.chromium}/bin/chromium"

              export ZDOTDIR=$(mktemp -d)
              cat > "$ZDOTDIR/.zshrc" << 'EOF'
                source ~/.zshrc
                function parse_git_branch {
                  git branch --no-color 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\ ->\ \1/'
                }
                function display_jobs_count_if_needed {
                  local job_count=$(jobs -s | wc -l | tr -d " ")
                  if [ $job_count -gt 0 ]; then echo "%B%F{yellow}%j| "; fi
                }
                # PROMPT_SUBST re-evaluates $(...) on every prompt redraw,
                # keeping the git branch and clock live. Single quotes required.
                setopt PROMPT_SUBST
                PROMPT='%F{blue}$(date +%H:%M:%S) $(display_jobs_count_if_needed)%B%F{green}%n %F{blue}%~%F{cyan} ❄%F{yellow}$(parse_git_branch) %f%{$reset_color%}'
              EOF
              if [ -z "$DIRENV_IN_ENVRC" ]; then
                exec ${pkgs.zsh}/bin/zsh -i
              fi
            '';
          };
        });

      # ── Checks ─────────────────────────────────────────────────────────────────
      # $ nix flake check
      # Sandboxed checks: lint and format run purely from sources.
      # Node.js unit tests run via buildNpmPackage (offline npm deps, no browser).
      checks = forAllSystems (system:
        let
          pkgs = pkgsFor system;

          # Shared base for source-only checks (no npm needed).
          src = self;

          # Node.js unit tests — hermetic offline npm install via buildNpmPackage.
          test-node = pkgs.buildNpmPackage {
            pname           = "qunitx-test-node";
            version         = "0.0.0";
            inherit src;
            npmDepsHash     = "sha256-6mZQlt2xRnXBQBrc9TCi6fA8XpRnEURxUYReLyYsBTQ=";
            dontBuild       = true;
            doCheck         = true;
            nativeCheckInputs = [ pkgs.nodejs_24 ];
            checkPhase      = ''
              node --experimental-strip-types --test test/index.ts
            '';
            installPhase    = "touch $out";
          };

          # Deno lint — no npm, just the shims/ sources.
          lint = pkgs.runCommandNoCC "qunitx-lint" {
            nativeBuildInputs = [ pkgs.deno ];
          } ''
            cd ${src}
            deno lint shims/
            touch $out
          '';

          # Deno doc lint — validates public API doc comments.
          lint-docs = pkgs.runCommandNoCC "qunitx-lint-docs" {
            nativeBuildInputs = [ pkgs.deno ];
          } ''
            cd ${src}
            deno doc --lint shims/deno/module.ts shims/deno/test.ts
            touch $out
          '';

          # Prettier format check.
          format = pkgs.runCommandNoCC "qunitx-format" {
            nativeBuildInputs = [ pkgs.nodePackages.prettier ];
          } ''
            cd ${src}
            prettier --check "test/**/*.ts" "*.ts" "package.json"
            touch $out
          '';

        in { inherit test-node lint lint-docs format; });

      # ── Apps ───────────────────────────────────────────────────────────────────
      # Run any task without entering the dev shell first.
      # Requires node_modules to be installed (`npm install` once).
      #
      #   nix run            → npm test (all runtimes)
      #   nix run .#build
      #   nix run .#test
      #   nix run .#test-node
      #   nix run .#test-deno
      #   nix run .#test-browser
      #   nix run .#coverage
      #   nix run .#bench
      #   nix run .#lint
      #   nix run .#format
      #   nix run .#docs
      apps = forAllSystems (system:
        let
          pkgs   = pkgsFor system;
          path   = pkgs.lib.makeBinPath [ pkgs.nodejs_24 pkgs.deno ];
          chrome = "${pkgs.chromium}/bin/chromium";

          mkNpmApp = name: script: {
            type    = "app";
            program = toString (pkgs.writeShellScript name ''
              export PATH="${path}:$PATH"
              export CHROME_BIN="${chrome}"
              exec npm run ${script} "$@"
            '');
          };
        in {
          default      = mkNpmApp "test"         "test";
          build        = mkNpmApp "build"        "build";
          test         = mkNpmApp "test"         "test";
          test-node    = mkNpmApp "test-node"    "test:node";
          test-deno    = mkNpmApp "test-deno"    "test:deno";
          test-browser = mkNpmApp "test-browser" "test:browser";
          coverage     = mkNpmApp "coverage"     "coverage";
          bench        = mkNpmApp "bench"        "bench";
          lint         = mkNpmApp "lint"         "lint";
          format       = mkNpmApp "format"       "format";
          docs         = mkNpmApp "docs"         "docs";
        });
    };
}
