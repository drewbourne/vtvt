import { RecipeVariantProps, sva } from "@styled-system/css";
import { ButtonHTMLAttributes, ReactNode } from "react";

const button = sva({
  className: "button",
  slots: ["root", "start", "content", "end"],
  base: {
    root: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",

      borderWidth: "2",
      borderStyle: "solid",
      borderColor: "black",
    },
    content: {
      fontWeight: "bolder",
    },
  },
  variants: {
    size: {
      lg: {
        root: { paddingInline: "2", paddingBlock: "1" },
        content: { fontSize: "lg" },
      },
      md: {
        root: { padding: "1.5", paddingBlock: "1" },
        content: { fontSize: "md" },
      },
      sm: {
        root: { padding: "1", paddingBlock: "0" },
        content: { fontSize: "sm" },
      },
      xs: {
        root: { padding: "0.5", paddingBlock: "0" },
        content: { fontSize: "xs" },
      },
    },
  },
  defaultVariants: {
    size: "xs",
  },
});

type ButtonProps = RecipeVariantProps<typeof button>;

export function Button({
  children,
  start,
  end,
  size,
  ...props
}: {
  children: ReactNode;
  start?: ReactNode;
  end?: ReactNode;
} & ButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = button({ size });

  return (
    <button {...props} className={classes.root}>
      {start && <span className={classes.start}>{start}</span>}
      <span className="content">{children}</span>
      {end && <span className={classes.end}>{end}</span>}
    </button>
  );
}
