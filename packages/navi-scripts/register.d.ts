import { Matcher } from "navi";

export interface RegisterOptions {
  /**
   * The value of NODE_ENV that the app was built with.
   */
  environment?: string,

  /**
   * An object that will be passed to renderPageString().
   */
  exports?: any,

  /**
   * Whether the app is being built, or being run in the browser. This is
   * automatically set by navi-scripts.
   */
  isBuild?: boolean,

  /**
   * The main function that should be called in the browser (but not during
   * the build script)
   */
  main: () => any,

  /**
   * Any modules that need to be shared between the application and the build
   * script. By default, 'react' and 'react-navi' will be made available here.
   */
  sharedModules?: { [name: string]: any },

  /**
   * The app's root switch.
   */
  routes: Matcher<any>,
}

declare function register(options: RegisterOptions): void;
declare function getRegistered(): RegisterOptions;

export default register
export { getRegistered }