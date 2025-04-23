declare namespace React.JSX {
  interface IntrinsicElements {
    [key: `mock-${element}`]: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
