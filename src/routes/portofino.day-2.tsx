import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "./portofino.day-{$day}";

export const Route = createFileRoute("/portofino/day-2")({
  head: () => getPortofinoDayHead("day-2"),
  component: () => <PortofinoDayTemplate slug="day-2" />,
});
