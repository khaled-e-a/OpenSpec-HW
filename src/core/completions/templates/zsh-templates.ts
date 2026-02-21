/**
 * Static template strings for Zsh completion scripts.
 * These are Zsh-specific helper functions that never change.
 */

export const ZSH_DYNAMIC_HELPERS = `# Dynamic completion helpers

# Use openspec-hw __complete to get available changes
_openspec_hw_complete_changes() {
  local -a changes
  while IFS=$'\\t' read -r id desc; do
    changes+=("$id:$desc")
  done < <(openspec-hw __complete changes 2>/dev/null)
  _describe "change" changes
}

# Use openspec-hw __complete to get available specs
_openspec_hw_complete_specs() {
  local -a specs
  while IFS=$'\\t' read -r id desc; do
    specs+=("$id:$desc")
  done < <(openspec-hw __complete specs 2>/dev/null)
  _describe "spec" specs
}

# Get both changes and specs
_openspec_hw_complete_items() {
  local -a items
  while IFS=$'\\t' read -r id desc; do
    items+=("$id:$desc")
  done < <(openspec-hw __complete changes 2>/dev/null)
  while IFS=$'\\t' read -r id desc; do
    items+=("$id:$desc")
  done < <(openspec-hw __complete specs 2>/dev/null)
  _describe "item" items
}`;
