{
  description = "A flake for qunitx npm package";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  inputs.napalm.url = "github:nix-community/napalm";
  inputs.napalm.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, napalm }:
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages."${system}";
  in {
    packages."${system}".default = napalm.legacyPackages."${system}".buildPackage ./. {
      nodejs = pkgs.nodejs_24;
      PUPPETEER_SKIP_DOWNLOAD=1;
    };

    devShells."${system}".default = pkgs.mkShell {
      nativeBuildInputs = [
        pkgs.pkg-config
        pkgs.deno
        pkgs.nodejs_24
        pkgs.git-cliff
        # self.packages.default.nativeBuildInputs
        # self.packages.default.buildInputs
      ];

      doCheck = false; # Disables automatically running tests for `$ nix develop` and direnv

      shellHook = ''
        export ZDOTDIR=$(mktemp -d)
        cat > "$ZDOTDIR/.zshrc" << 'EOF'
          source ~/.zshrc # Source the original ~/.zshrc, required.
          function parse_git_branch {
            git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\ ->\ \1/'
          }
          function display_jobs_count_if_needed {
            local job_count=$(jobs -s | wc -l | tr -d " ")
            if [ $job_count -gt 0 ]; then
              echo "%B%F{yellow}%j| ";
            fi
          }
          # NOTE: Custom prompt with a snowflake: signals we are in `$ nix develop` shell
          PROMPT="%F{blue}$(date +%H:%M:%S) $(display_jobs_count_if_needed)%B%F{green}%n %F{blue}%~%F{cyan} ❄%F{yellow}$(parse_git_branch) %f%{$reset_color%}"
        EOF
        if [ -z "$DIRENV_IN_ENVRC" ]; then # This makes `$ nix develop` universally working with direnv without infinite loop
          exec ${pkgs.zsh}/bin/zsh -i
        fi
      '';
    };
  };
}
