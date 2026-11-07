import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface HeaderState {
  fieldId: string;
  badge: "real" | "simulated";
  tourPulse: number;
}

export const HEADER_DEFAULT: HeaderState = { fieldId: "pallas", badge: "real", tourPulse: 0 };

export const Header: React.FC<{ state: HeaderState }> = () => <Stub name="Header (stub)" rect={focusRect("header")} />;
