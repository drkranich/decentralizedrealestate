import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type GlassSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type Props = {
  value: string;
  options: GlassSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
};

export function GlassSelect({
  value,
  options,
  onValueChange,
  placeholder = "Selecione...",
  triggerClassName,
  contentClassName,
  itemClassName,
}: Props) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-10 rounded-xl bg-glass-fill text-sm shadow-soft backdrop-blur-xl",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        avoidCollisions
        className={cn("max-h-72 rounded-2xl bg-card/90 p-1 backdrop-blur-2xl", contentClassName)}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={cn("rounded-xl", itemClassName)}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
