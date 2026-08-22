import { useQuery } from "@tanstack/react-query";
import { listRackets } from "./rackets.functions";
import { toEngineRackets, type EngineRacket } from "./racket-engine";

/** Single source of truth for every racket surface: catalog, recommendations, compare, modify. */
export function useRackets() {
  const query = useQuery({
    queryKey: ["rackets"],
    queryFn: () => listRackets(),
    staleTime: 5 * 60_000,
  });
  const rackets: EngineRacket[] = query.data ? toEngineRackets(query.data) : [];
  return { ...query, rackets };
}
