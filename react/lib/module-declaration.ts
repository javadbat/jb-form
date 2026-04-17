import type { JBFormWebComponent } from "jb-form";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'jb-form': JBFormElement;
    }
    interface JBFormElement extends React.DetailedHTMLProps<React.HTMLAttributes<JBFormWebComponent>, JBFormWebComponent> {
      name?:string
    }
  }
}
