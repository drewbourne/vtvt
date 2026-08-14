"use client";

import { cx, sva } from "@styled-system/css";
import {
  Children,
  createContext,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useContext,
} from "react";

const field = sva({
  className: "field",
  slots: ["root", "label", "content", "control", "start", "end"],
  base: {
    root: {
      display: "grid",
      gridTemplateAreas: '"label label" "content content"',
    },
    label: {
      gridArea: "label",
      fontSize: "xs",
      fontWeight: "bolder",
    },
    content: {
      gridArea: "content",
      display: "grid",
      gridTemplateAreas: '"start control end"',
      gridTemplateColumns: "min-content 1fr min-content",
      gridTemplateRows: "max-content",
      gap: 0,

      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "black",
    },
    control: {
      gridArea: "control",
      paddingInline: "2",
      width: "100%",
    },
    start: {
      gridArea: "start",
    },
    end: {
      gridArea: "end",
    },
  },
});

const FieldSvaContext = createContext<ReturnType<typeof field>>({});

export const useFieldSva = () => useContext(FieldSvaContext);

export function FieldLayout({ children }: PropsWithChildren) {
  const classes = field({});

  return (
    <FieldSvaContext.Provider value={classes}>
      <div className={classes.root}>{children}</div>
    </FieldSvaContext.Provider>
  );
}

export function FieldLabel({ children }: PropsWithChildren) {
  const classes = useFieldSva();

  return <label className={cx(classes.label)}>{children}</label>;
}

export function FieldContent({ children }: PropsWithChildren) {
  const classes = useFieldSva();

  return <div className={cx(classes.content)}>{children}</div>;
}

export function FieldControl({ children }: PropsWithChildren) {
  const classes = useFieldSva();

  return <div className={cx(classes.control)}>{children}</div>;
}

export function FieldStart({ children }: PropsWithChildren) {
  const classes = useFieldSva();

  return <label className={cx(classes.start)}>{children}</label>;
}

export function FieldEnd({ children }: PropsWithChildren) {
  const classes = useFieldSva();

  return <label className={cx(classes.start)}>{children}</label>;
}

export function Field({
  label,
  input,
  start = null,
  end = null,
}: {
  label: ReactNode;
  input: ReactNode;
  start?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <FieldLayout>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <FieldStart>{start}</FieldStart>
        <FieldControl>{input}</FieldControl>
        <FieldEnd>{end}</FieldEnd>
      </FieldContent>
    </FieldLayout>
  );
}
