{
  description = "A flake for qunitx npm package";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.napalm.url = "github:nix-community/napalm";
  inputs.napalm.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, napalm }:
    let
      system = "x86_64-linux";
      supportedSystems = [ "x86_64-linux" "i686-linux" "aarch64-linux" ];
      forAllSystems = f: nixpkgs.lib.genAttrs supportedSystems (system: f system);
      pkgs = nixpkgs.legacyPackages."${system}";
    in {
      packages = forAllSystems (system: rec {
        inherit system;
        default = napalm.legacyPackages."${system}".buildPackage ./. {
          nodejs = pkgs.nodejs_20;
          PUPPETEER_SKIP_DOWNLOAD=1;
        };
      });

      devShells = forAllSystems (system: rec {
        inherit system;
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            deno
            nodejs_20
          ];
        };
      });
    };
}
