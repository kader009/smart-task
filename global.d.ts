declare module '*.css' {
  const content: { [className: string]: string };
  export = content;
  export default content;
}