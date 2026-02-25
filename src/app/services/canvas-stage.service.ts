import { Injectable, signal } from "@angular/core";
import Konva from "konva";

@Injectable({
  providedIn: "root",
})
export class CanvasStageService {
  stage = signal<Konva.Stage | null>(null);

  constructor() {}
}
