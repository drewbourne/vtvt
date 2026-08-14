"use client";

import { sva } from "@styled-system/css";
import { createContext, useContext } from "react";

const appLayout = sva({
  className: "appLayout",
  slots: ["root", "sidebar", "header", "content", "footer"],
  base: {
    root: {
      width: "100vw",
      minHeight: "100vh",
      display: "grid",
      gridTemplateAreas: `
        "app-sidebar app-header"
        "app-sidebar app-content"
        "app-sidebar app-footer"
      `,
      gridTemplateColumns: `auto 1fr`,
      gridTemplateRows: `auto 1fr auto`,
    },
    sidebar: {
      gridArea: "app-sidebar",
      borderRightWidth: "thin",
      borderRightStyle: "solid",
      borderRightColor: "colorPalette.700",
    },
    header: {
      gridArea: "app-header",
      borderBottomWidth: "thin",
      borderBottomStyle: "solid",
      borderBottomColor: "colorPalette.700",
    },
    content: {
      gridArea: "app-content",
      padding: "1",
    },
    footer: {
      gridArea: "app-footer",
      borderTopWidth: "thin",
      borderTopStyle: "solid",
      borderTopColor: "colorPalette.700",
    },
  },
});

const AppLayoutSvaContext = createContext<ReturnType<typeof appLayout>>({});
const useAppLayout = () => useContext(AppLayoutSvaContext);

export function AppLayout({ children }: React.PropsWithChildren) {
  const classes = appLayout();

  return (
    <AppLayoutSvaContext.Provider value={classes}>
      <div className={classes.root}>{children}</div>
    </AppLayoutSvaContext.Provider>
  );
}

export function AppSidebar({ children }: React.PropsWithChildren) {
  const classes = useAppLayout();

  return <aside className={classes.sidebar}>{children}</aside>;
}

export function AppHeader({ children }: React.PropsWithChildren) {
  const classes = useAppLayout();

  return <div className={classes.header}>{children}</div>;
}

export function AppContent({ children }: React.PropsWithChildren) {
  const classes = useAppLayout();

  return <div className={classes.content}>{children}</div>;
}

export function AppFooter({ children }: React.PropsWithChildren) {
  const classes = useAppLayout();

  return <div className={classes.footer}>{children}</div>;
}
