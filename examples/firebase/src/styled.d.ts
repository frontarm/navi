import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    borderRadius: string;

    colors: {
      primary: string,

      border: string,

      text: string,
      lightText: string,
    };
  }
}