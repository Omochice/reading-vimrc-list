// `@fontsource-variable/*` packages expose only CSS through their `.` export and
// ship no type declarations. Declaring the module here lets the side-effect imports
// in `main.ts` satisfy TypeScript 6.0's `noUncheckedSideEffectImports`, which now
// defaults to `true`, without turning the check off for the whole project.
declare module "@fontsource-variable/*";
