import axios, { AxiosError } from "axios";

import type { ApiErrorBody, Location, Menu } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ApiFailure =
  | {
      kind: "network";
      message: string;
    }
  | {
      kind: "server";
      status: number;
      code?: string;
      message: string;
    };

export const isApiFailure = (value: unknown): value is ApiFailure =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  (value.kind === "network" || value.kind === "server");

const toApiFailure = (error: AxiosError<ApiErrorBody>): ApiFailure => {
  if (!error.response) {
    return {
      kind: "network",
      message: "Couldn't reach the server. Is it running?",
    };
  }

  const { status, data } = error.response;

  return {
    kind: "server",
    status,
    code: data?.error?.code,
    message: data?.error?.message ?? `Server responded with ${status}`,
  };
};

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Cache-Control": "no-store",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    throw toApiFailure(error);
  },
);

async function get<T>(
  url: string,
  params?: Readonly<Record<string, string>>,
): Promise<T> {
  const { data } = await http.get<T>(url, {
    params,
  });

  return data;
}

export async function fetchLocations(): Promise<Location[]> {
  const response = await get<{ locations: Location[] }>("/api/locations");
  return response.locations;
}

export function fetchMenu(locationId: string): Promise<Menu> {
  return get<Menu>("/api/menus", { locationId });
}
