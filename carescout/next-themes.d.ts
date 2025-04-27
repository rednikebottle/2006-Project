// next-themes.d.ts
declare module "next-themes" {
    export interface ThemeProviderProps {
      children: React.ReactNode;
      attribute?: string;
      defaultTheme?: string;
      enableSystem?: boolean;
      disableTransitionOnChange?: boolean;
    }
    export const ThemeProvider: React.FC<ThemeProviderProps>;
    export function useTheme(): { theme: string; setTheme: (theme: string) => void };
  }