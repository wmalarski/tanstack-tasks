import { cn } from "@/integrations/tailwind/utils";

import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { buttonVariants } from "./button";

export type LinkProps = ComponentProps<"a"> &
  VariantProps<typeof buttonVariants>;

export const BasicLink = ({
  size,
  variant = "link",
  className,
  ...props
}: LinkProps) => {
  return (
    <a
      {...props}
      className={cn(buttonVariants({ className, size, variant }))}
    />
  );
};

const CreatedLink = createLink(BasicLink);

const Link: LinkComponent<typeof BasicLink> = (props) => {
  return <CreatedLink {...props} />;
};

export { Link };
