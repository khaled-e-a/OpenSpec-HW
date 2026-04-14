/**
 * Static template strings for Bash completion scripts.
 * These are Bash-specific helper functions that never change.
 */

export const BASH_DYNAMIC_HELPERS = `# Dynamic completion helpers

_synergyspec_hw_complete_changes() {
  local changes
  changes=$(synergyspec-hw __complete changes 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$changes" -- "$cur"))
}

_synergyspec_hw_complete_specs() {
  local specs
  specs=$(synergyspec-hw __complete specs 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$specs" -- "$cur"))
}

_synergyspec_hw_complete_items() {
  local items
  items=$(synergyspec-hw __complete changes 2>/dev/null | cut -f1; synergyspec-hw __complete specs 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$items" -- "$cur"))
}`;
