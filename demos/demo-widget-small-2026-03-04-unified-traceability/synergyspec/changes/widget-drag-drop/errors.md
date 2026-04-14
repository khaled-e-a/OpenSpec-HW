ERROR in [eslint]
src/hooks/useKeyboardNavigation.ts
  Line 104:9:  Parsing error: '>' expected

webpack compiled with 2 errors
ERROR in src/components/AnimatedWidget.tsx:42:7
TS2322: Type '{ idle: { scale: number; rotate: number; }; dragging: { scale: number; rotate: number; transition: { type: string; stiffness: number; damping: number; }; }; dropping: { scale: number; rotate: number; transition: { ...; }; }; }' is not assignable to type 'Variants'.
  Property 'dragging' is incompatible with index signature.
    Type '{ scale: number; rotate: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
      Type '{ scale: number; rotate: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
        Type '{ scale: number; rotate: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues$1 | undefined; }'.
          Types of property 'transition' are incompatible.
            Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
              Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
                Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
                  Types of property 'type' are incompatible.
                    Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
    40 |   return (
    41 |     <motion.div
  > 42 |       variants={variants}
       |       ^^^^^^^^
    43 |       initial="idle"
    44 |       animate={isDragging ? "dragging" : isDropping ? "dropping" : "idle"}
    45 |       whileHover={{ scale: 1.02 }}

ERROR in src/components/DraggableWidget.tsx:53:17
TS2322: Type 'string | false | undefined' is not assignable to type 'boolean | undefined'.
  Type 'string' is not assignable to type 'boolean | undefined'.
    51 |                 {...widgetProps}
    52 |                 isDragging={snapshot.isDragging}
  > 53 |                 isDropping={!snapshot.isDragging && provided.draggableProps.style?.transform}
       |                 ^^^^^^^^^^
    54 |               />
    55 |             </ShakeAnimation>
    56 |           </div>

ERROR in src/hooks/useKeyboardNavigation.ts
TS1161: Unterminated regular expression literal.

ERROR in src/hooks/useKeyboardNavigation.ts:102:14
TS2322: Type '() => string' is not assignable to type 'FC<{}>'.
  Type 'string' is not assignable to type 'ReactElement<any, any>'.
    100 |
    101 | // Helper component to add keyboard instructions
  > 102 | export const KeyboardInstructions: React.FC = () => {
        |              ^^^^^^^^^^^^^^^^^^^^
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
    105 |       <h3>Keyboard Navigation</h3>

ERROR in src/hooks/useKeyboardNavigation.ts:104:6
TS2304: Cannot find name 'div'.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |      ^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:10
TS1005: '>' expected.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |          ^^^^^^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:10
TS2304: Cannot find name 'className'.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |          ^^^^^^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:19
TS1005: ')' expected.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                   ^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:44
TS1005: ';' expected.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                                            ^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:44
TS2304: Cannot find name 'role'.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                                            ^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:58
TS1005: ';' expected.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                                                          ^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:58
TS2304: Cannot find name 'aria'.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                                                          ^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:63
TS2304: Cannot find name 'live'.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                                                               ^^^^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:104:67
TS1005: ';' expected.
    102 | export const KeyboardInstructions: React.FC = () => {
    103 |   return (
  > 104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
        |                                                                   ^
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:8
TS2304: Cannot find name 'h3'.
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |        ^^
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:11
TS2304: Cannot find name 'Keyboard'.
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |           ^^^^^^^^
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:20
TS1005: ';' expected.
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |                    ^^^^^^^^^^
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:20
TS2552: Cannot find name 'Navigation'. Did you mean 'Navigator'?
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |                    ^^^^^^^^^^
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:20
TS2365: Operator '<' cannot be applied to types 'boolean' and 'RegExp'.
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |                    ^^^^^^^^^^^^^^^
  > 106 |       <ul>
        | ^^^^^^^^^^
  > 107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:20
TS2365: Operator '<' cannot be applied to types 'boolean' and 'RegExp'.
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |                    ^^^^^^^^^^^^^^^
  > 106 |       <ul>
        | ^^^^^^^^^^
  > 107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
        | ^^^^^^^^^^
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:105:20
TS2365: Operator '>' cannot be applied to types 'boolean' and 'number'.
    103 |   return (
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
  > 105 |       <h3>Keyboard Navigation</h3>
        |                    ^^^^^^^^^^^^^^^
  > 106 |       <ul>
        | ^^^^^^^^^^
  > 107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
        | ^^^^^^^^^^
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:106:8
TS2304: Cannot find name 'ul'.
    104 |     <div className="keyboard-instructions" role="status" aria-live="polite">
    105 |       <h3>Keyboard Navigation</h3>
  > 106 |       <ul>
        |        ^^
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>

ERROR in src/hooks/useKeyboardNavigation.ts:107:10
TS2304: Cannot find name 'li'.
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
  > 107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
        |          ^^
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:107:14
TS2304: Cannot find name 'kbd'.
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
  > 107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
        |              ^^^
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:107:18
TS2304: Cannot find name 'Tab'.
    105 |       <h3>Keyboard Navigation</h3>
    106 |       <ul>
  > 107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
        |                  ^^^
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:10
TS2304: Cannot find name 'li'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |          ^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:14
TS2304: Cannot find name 'kbd'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |              ^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:18
TS2304: Cannot find name 'Enter'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                  ^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:52
TS2304: Cannot find name 'Start'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                                                    ^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:58
TS1005: ';' expected.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                                                          ^^^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:58
TS2304: Cannot find name 'dragging'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                                                          ^^^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:67
TS1434: Unexpected keyword or identifier.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                                                                   ^^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:67
TS2304: Cannot find name 'focused'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                                                                   ^^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:108:75
TS2304: Cannot find name 'widget'.
    106 |       <ul>
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
  > 108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        |                                                                           ^^^^^^
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>

ERROR in src/hooks/useKeyboardNavigation.ts:109:10
TS2304: Cannot find name 'li'.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |          ^^
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>

ERROR in src/hooks/useKeyboardNavigation.ts:109:14
TS2304: Cannot find name 'kbd'.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |              ^^^
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>

ERROR in src/hooks/useKeyboardNavigation.ts:109:18
TS2304: Cannot find name 'Arrow'.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |                  ^^^^^
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>

ERROR in src/hooks/useKeyboardNavigation.ts:109:24
TS1005: ';' expected.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |                        ^^^^
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>

ERROR in src/hooks/useKeyboardNavigation.ts:109:24
TS2304: Cannot find name 'Keys'.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |                        ^^^^
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>

ERROR in src/hooks/useKeyboardNavigation.ts:109:24
TS2365: Operator '<' cannot be applied to types 'boolean' and 'RegExp'.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:109:24
TS2365: Operator '>' cannot be applied to types 'boolean' and 'number'.
    107 |         <li><kbd>Tab</kbd> - Navigate between widgets</li>
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
  > 109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        |                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:10
TS2304: Cannot find name 'li'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |          ^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:14
TS2304: Cannot find name 'kbd'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |              ^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:18
TS2304: Cannot find name 'Enter'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |                  ^^^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:52
TS2304: Cannot find name 'Drop'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |                                                    ^^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:57
TS1005: ';' expected.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |                                                         ^^^^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:57
TS2304: Cannot find name 'widget'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |                                                         ^^^^^^
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
    112 |       </ul>
    113 |     </div>

ERROR in src/hooks/useKeyboardNavigation.ts:110:57
TS2365: Operator '<' cannot be applied to types 'boolean' and 'RegExp'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |                                                         ^^^^^^^^^^^
  > 111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    112 |       </ul>
    113 |     </div>
    114 |   );

ERROR in src/hooks/useKeyboardNavigation.ts:110:57
TS2365: Operator '<' cannot be applied to types 'boolean' and 'RegExp'.
    108 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
  > 110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        |                                                         ^^^^^^^^^^^
  > 111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 112 |       </ul>
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 113 |     </div>
        | ^^^^^^^^^^^
    114 |   );
    115 | };

ERROR in src/hooks/useKeyboardNavigation.ts:111:10
TS2304: Cannot find name 'li'.
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
  > 111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
        |          ^^
    112 |       </ul>
    113 |     </div>
    114 |   );

ERROR in src/hooks/useKeyboardNavigation.ts:111:14
TS2304: Cannot find name 'kbd'.
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
  > 111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
        |              ^^^
    112 |       </ul>
    113 |     </div>
    114 |   );

ERROR in src/hooks/useKeyboardNavigation.ts:111:18
TS2304: Cannot find name 'Escape'.
    109 |         <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
  > 111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
        |                  ^^^^^^
    112 |       </ul>
    113 |     </div>
    114 |   );

ERROR in src/hooks/useKeyboardNavigation.ts:112:8
TS1110: Type expected.
    110 |         <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
    111 |         <li><kbd>Escape</kbd> - Cancel drag operation</li>
  > 112 |       </ul>
        |        ^
    113 |     </div>
    114 |   );
    115 | };

ERROR in src/hooks/useKeyboardNavigation.ts:114:3
TS1128: Declaration or statement expected.
    112 |       </ul>
    113 |     </div>
  > 114 |   );
        |   ^
    115 | };

ERROR in src/hooks/useKeyboardNavigation.ts:115:1
TS1128: Declaration or statement expected.
    113 |     </div>
    114 |   );
  > 115 | };
        | ^

ERROR in src/hooks/useWidgetVirtualization.ts:112:10
TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    110 | // Memoization helper for expensive calculations
    111 | export const useMemoizedGrid = (widgets: any[], gridSize: number) => {
  > 112 |   return React.useMemo(() => {
        |          ^^^^^
    113 |     // Expensive grid calculation
    114 |     const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    115 |


