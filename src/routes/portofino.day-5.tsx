import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "./portofino.day-{$day}";

export const Route = createFileRoute("/portofino/day-5")({
  head: () => getPortofinoDayHead("day-5"),
  component: () => <PortofinoDayTemplate slug="day-5" />,
});
