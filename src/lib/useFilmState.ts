import { DEFAULT_FILM_STATE, mergeFilmState, type FilmState } from "../config/filmState";
import { sceneState } from "../scenes";

export function filmStateAt(frame: number): FilmState {
  return mergeFilmState(DEFAULT_FILM_STATE, sceneState(frame));
}

export function useFilmState(frame: number): FilmState {
  return filmStateAt(frame);
}
