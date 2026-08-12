"use client";

import { cx, sva, RecipeVariantProps } from "@styled-system/css";
import {
  createContext,
  PropsWithChildren,
  TdHTMLAttributes,
  ThHTMLAttributes,
  useContext,
} from "react";

const table = sva({
  className: "table",
  slots: ["root", "table", "thead", "tbody", "tfoot", "tr", "th", "td"],
  base: {
    root: {
      width: "100%",
    },
    table: {
      width: "100%",
      tableLayout: "fixed",
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
    th: {
      paddingBlock: "1",
      paddingInline: "2",
    },
    td: {
      paddingBlock: "1",
      paddingInline: "2",
    },
  },
});

const row = sva({
  className: "row",
  slots: ["row"],
});

const cell = sva({
  className: "cell",
  slots: ["cell"],
  variants: {
    cellKind: {
      action: {
        cell: {
          textAlign: "center",
        },
      },
      broker: {
        cell: {
          textAlign: "left",
          width: "120px",
        },
      },
      number: {
        cell: {
          width: "120px",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        },
      },
      price: {
        cell: {
          width: "120px",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        },
      },
      symbol: {
        cell: {
          textAlign: "left",
          fontWeight: "bolder",
        },
      },
      text: {
        cell: {
          textAlign: "left",
        },
      },
    },
  },
});

type CellProps = RecipeVariantProps<typeof cell>;

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

export function Th({
  children,
  className,
  cellKind,
  ...props
}: PropsWithChildren & ThHTMLAttributes<HTMLTableCellElement> & CellProps) {
  const tableClasses = useTableSva();
  const cellClasses = cell({ cellKind });

  return (
    <th
      className={cx(tableClasses.th, cellClasses?.cell, className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  cellKind,
  ...props
}: PropsWithChildren & TdHTMLAttributes<HTMLTableCellElement> & CellProps) {
  const tableClasses = useTableSva();
  const cellClasses = cell({ cellKind });

  return (
    <td className={cx(tableClasses.td, cellClasses.cell, className)} {...props}>
      {children}
    </td>
  );
}
