import { sva } from "@styled-system/css";
import { PropsWithChildren } from "react";

const panel = sva({
  className: "panel",
  slots: ["root", "header", "content", "footer"],
  base: {
    root: {
      display: "grid",
      gridTemplateAreas: `
        "panel-header"
        "panel-content"
        "panel-footer"
      `,
      borderColor: "colorPalette.700",
      borderStyle: "solid",
      borderWidth: "thin",
      borderRadius: "sm",
      boxShadow: "sm",
    },
    header: {
      gridArea: "panel-header",
    },
    content: {
      gridArea: "panel-content",
    },
    footer: {
      gridArea: "panel-footer",
    },
  },
});

export function Panel({ children }: PropsWithChildren) {
  const classes = panel();

  return <div className={classes.root}>{children}</div>;
}

export function PanelHeader({ children }: PropsWithChildren) {
  const classes = panel();

  return <div className={classes.header}>{children}</div>;
}

export function PanelContent({ children }: PropsWithChildren) {
  const classes = panel();

  return <div className={classes.content}>{children}</div>;
}

export function PanelFooter({ children }: PropsWithChildren) {
  const classes = panel();

  return <div className={classes.footer}>{children}</div>;
}
