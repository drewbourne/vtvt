import { sva } from "@styled-system/css";

const appLayout = sva({
  className: "appLayout",
  slots: ["root", "sidebar", "header", "content", "footer"],
  base: {
    root: {
      width: "100%",
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
    },
    footer: {
      gridArea: "app-footer",
      borderTopWidth: "thin",
      borderTopStyle: "solid",
      borderTopColor: "colorPalette.700",
    },
  },
});

export function AppLayout({ children }: React.PropsWithChildren) {
  const classes = appLayout({});

  return <div className={classes.root}>{children}</div>;
}

export function AppSidebar({ children }: React.PropsWithChildren) {
  const classes = appLayout({});

  return <aside className={classes.sidebar}>{children}</aside>;
}

export function AppHeader({ children }: React.PropsWithChildren) {
  const classes = appLayout({});

  return <div className={classes.header}>{children}</div>;
}

export function AppContent({ children }: React.PropsWithChildren) {
  const classes = appLayout({});

  return <div className={classes.content}>{children}</div>;
}

export function AppFooter({ children }: React.PropsWithChildren) {
  const classes = appLayout({});

  return <div className={classes.footer}>{children}</div>;
}
