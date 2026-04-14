# Installation

## Prerequisites

- **Node.js 20.19.0 or higher** — Check your version: `node --version`

## Package Managers

### npm

```bash
npm install -g @khaledea/synergyspec-hw@latest
```

### pnpm

```bash
pnpm add -g @khaledea/synergyspec-hw@latest
```

### yarn

```bash
yarn global add @khaledea/synergyspec-hw@latest
```

### bun

```bash
bun add -g @khaledea/synergyspec-hw@latest
```

## Nix

Run SynergySpec directly without installation:

```bash
nix run github:Fission-AI/SynergySpec -- init
```

Or install to your profile:

```bash
nix profile install github:Fission-AI/SynergySpec
```

Or add to your development environment in `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    openspec.url = "github:Fission-AI/SynergySpec";
  };

  outputs = { nixpkgs, openspec, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ openspec.packages.x86_64-linux.default ];
    };
  };
}
```

## Verify Installation

```bash
synergyspec-hw --version
```

## Next Steps

After installing, initialize SynergySpec in your project:

```bash
cd your-project
synergyspec-hw init
```

See [Getting Started](getting-started.md) for a full walkthrough.
