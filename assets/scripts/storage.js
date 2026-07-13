import { config, stats } from "./game.js";

export function setConfig() {
  localStorage.setItem("config", JSON.stringify(config));
}

export function getConfig() {
  return JSON.parse(localStorage.getItem("config"));
}

export function setStats() {
  localStorage.setItem("stats", JSON.stringify(stats));
}

export function getStats() {
  return JSON.parse(localStorage.getItem("stats"));
}
