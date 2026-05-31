import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "./portofino.day-{$day}";

export const Route = createFileRoute("/portofino/day-3")({
  head: () => getPortofinoDayHead("day-3"),
  component: () => <PortofinoDayTemplate slug="day-3" />,
});
