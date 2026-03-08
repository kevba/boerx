import { Injectable, signal } from "@angular/core";
import { Entity } from "../../canvas/entities/Entity";

@Injectable({
  providedIn: "root",
})
export abstract class EntitiesService {
  entities = signal<Entity<any, any>[]>([]);
}
