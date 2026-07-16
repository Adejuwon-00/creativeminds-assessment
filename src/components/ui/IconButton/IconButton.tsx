import { forwardRef } from "react";
import { Button } from "../Button";
import type { IconButtonProps } from "./IconButton.types";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, size, isLoading, ...rest },
  ref,
) {
  return <Button ref={ref} variant="icon" size={size} isLoading={isLoading} leadingIcon={icon} {...rest} />;
});

IconButton.displayName = "IconButton";
