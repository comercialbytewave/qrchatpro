export type ThemePreference = {
    mode: "light" | "dark" | "system";
    primaryColor: "blue" | "red" | "green" | "yellow" | "purple" | "pink";
};

export const DEFAULT_THEME: ThemePreference = {
    mode: "system",
    primaryColor: "blue",
};
