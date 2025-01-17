/**TODO:
 * не знаю как сделать нормально и так чтобы было без any
 */
declare global {
  interface Window {
    CDEKWidget: any;
    CDEKWidgetInitialized?: boolean;
  }
}

export {};
