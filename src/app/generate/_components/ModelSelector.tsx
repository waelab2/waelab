"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { models, type Model } from "~/lib/constants";
import useGenerateStore from "~/lib/stores/useGenerateStore";

export default function ModelSelector({ isLoading }: { isLoading?: boolean }) {
  const { model, setModel } = useGenerateStore();

  return (
    <Select
      value={model}
      onValueChange={(value) => setModel(value as Model["id"])}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
