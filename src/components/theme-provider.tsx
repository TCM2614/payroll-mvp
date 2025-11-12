'use client';



import * as React from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';



// Derive props from the component to avoid version-specific type paths

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;



export function ThemeProvider({ children, ...props }: ThemeProviderProps) {

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;

}



export default ThemeProvider;

