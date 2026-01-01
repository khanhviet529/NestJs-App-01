import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscoveryService {
  private _routes: any[] = [];

  setRoutes(routes: any[]) {
    this._routes = routes;
  }

  getRoutes() {
    return this._routes;
  }
}
