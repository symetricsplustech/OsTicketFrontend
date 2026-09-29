import React from "react";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@shared/components/ui/select";

export function EngineerPicker() {
  return (
    <div className="space-y-4">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select workload" />
          <SelectContent>
            <SelectItem value="low">Light (2 tasks or fewer)</SelectItem>
            <SelectItem value="high">More than 5 tasks</SelectItem>
          </SelectContent>
        </SelectTrigger>
      </Select>
    </div>
  );
}
