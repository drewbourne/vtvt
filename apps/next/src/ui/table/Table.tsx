"use client";

import { sva } from "@styled-system/css";
import { createContext, PropsWithChildren, useContext } from "react";
// import { createSvaContext } from "../panda/createSvaContext";

const table = sva({
  className: "table",
  slots: ["root", "table", "thead", "tbody", "tfoot", "tr", "th", "td"],
  base: {
    root: {
      width: "100%",
    },
    table: {
      width: "100%",
    },
    thead: {},
    tbody: {},
    tfoot: {},
    tr: {
      "& th, & td": {
        borderBottomColor: "colorPalette.400",
        borderBottomStyle: "solid",
        borderBottomWidth: "thin",
      },
    },
    th: {},
    td: {},
  },
});

const row = sva({
  className: "row",
  slots: ["row"],
});

const cell = sva({
  className: "cell",
  slots: ["cell"],
});

const TableSvaContext = createContext<ReturnType<typeof table>>({});
const useTableSva = () => useContext(TableSvaContext);

const RowSvaContext = createContext<ReturnType<typeof row>>({});
const useRowSva = () => useContext(RowSvaContext);

export function TableLayout({ children }: PropsWithChildren) {
  const classes = table({});

  return (
    <TableSvaContext.Provider value={classes}>
      <div className={classes.root}>{children}</div>
    </TableSvaContext.Provider>
  );
}

export function Table({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <table className={classes.table}>{children}</table>;
}

export function Thead({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <thead className={classes.thead}>{children}</thead>;
}

export function Tbody({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <tbody className={classes.tbody}>{children}</tbody>;
}

export function Tfoot({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <tfoot className={classes.tfoot}>{children}</tfoot>;
}

export function Tr({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <tr className={classes.tr}>{children}</tr>;
}

export function Th({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <th className={classes.th}>{children}</th>;
}

export function Td({ children }: PropsWithChildren) {
  const classes = useTableSva();

  return <td className={classes.td}>{children}</td>;
}
