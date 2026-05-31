import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "./portofino.day-{$day}";

export const Route = createFileRoute("/portofino/day-4")({
  head: () => getPortofinoDayHead("day-4"),
  component: () => <PortofinoDayTemplate slug="day-4" />,
});
