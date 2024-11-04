import { Tooltip as TooltipPrimitive } from "bits-ui";
import Content from "./tooltip-content.svelte";

const { Root, Trigger, Provider } = TooltipPrimitive;

export {
  Content,
  Provider, Root,
  //
  Root as Tooltip,
  Content as TooltipContent, Provider as TooltipProvider, Trigger as TooltipTrigger, Trigger
};
