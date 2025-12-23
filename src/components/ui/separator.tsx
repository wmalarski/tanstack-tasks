import { cn } from "@/integrations/tailwind/utils";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

function Separator({ className, ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
        className,
      )}
      data-slot="separator"
      {...props}
    />
  );
}

export { Separator };
