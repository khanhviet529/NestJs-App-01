import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import {
  PATH_METADATA,
  METHOD_METADATA,
  VERSION_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';

export type RouteRow = {
  route?: string;
  method?: string;
};

export function normalizePath(p: string) {
  return ('/' + p).replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

export function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export const excludedExactRoutes = new Set([
  '/',
  '/v1/role/routes',
  '/docs',
  '/docs-json',
]);

export const filterUndefined = (r: RouteRow) => !!r.route;

export const filterTechnical = (r: RouteRow) => {
  const path = r.route;
  if (!path) return false;

  if (excludedExactRoutes.has(path)) return false;

  if (path.startsWith('/docs')) return false;

  if (/^\/(?:v\d+)?\/?$/.test(path)) return false;

  return true;
};

@Injectable()
export class RoutesService {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  listRoutes(): { route: string; method: string }[] {
    const rows: RouteRow[] = [];

    for (const wrapper of this.discovery.getControllers()) {
      const instance = wrapper.instance;
      const metatype = wrapper.metatype;
      if (!instance || !metatype) continue;

      const controllerPath =
        this.reflector.get<string>(PATH_METADATA, metatype) ?? '';

      const controllerVersions = asArray<string>(
        this.reflector.get(VERSION_METADATA, metatype) as any,
      );

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.scanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const handler = instance[methodName];
        if (typeof handler !== 'function') continue;

        const methodPath = this.reflector.get<string>(PATH_METADATA, handler);
        const httpMethod = this.reflector.get<number>(METHOD_METADATA, handler);

        if (methodPath === undefined || httpMethod === undefined) continue;

        const methodVersions = asArray<string>(
          this.reflector.get(VERSION_METADATA, handler) as any,
        );

        const versions = methodVersions.length
          ? methodVersions
          : controllerVersions;

        if (!versions.length) continue;

        const basePath = normalizePath(`${controllerPath}/${methodPath}`);

        for (const v of versions) {
          rows.push({
            route: normalizePath(`/v${v}${basePath}`),
            method: RequestMethod[httpMethod],
          });
        }
      }
    }

    const uniq = new Map<string, { route: string; method: string }>();

    rows
      .filter(filterUndefined)
      .filter(filterTechnical)
      .forEach((r) => {
        uniq.set(`${r.method}:${r.route}`, {
          route: r.route!,
          method: r.method!,
        });
      });

    return [...uniq.values()];
  }
}
