import { effect, inject, Injectable } from "@angular/core";
import Konva from "konva";
import {
  Machine,
  MachineService,
  MachineType,
} from "../services/machine.service";

@Injectable({
  providedIn: "root",
})
export class MachineRenderService {
  private machinesService = inject(MachineService);
  layer = new Konva.Layer();

  private iconMap: Record<MachineType, string> = {
    [MachineType.Tractor]: "🚜",
  };

  constructor() {
    effect(() => {
      const machines = this.machinesService.machines();
      machines.forEach((element, i) => {
        this.renderMachine(element, i + 1);
      });
    });
  }

  setStage(stage: Konva.Stage) {
    stage.add(this.layer);
  }

  private renderMachine(machine: Machine, i: number) {
    const layer = this.layer;
    if (!layer) return;

    const drawnMachine = layer.findOne(`#${machine.id}`);

    if (drawnMachine) {
      drawnMachine.to({ text: this.iconMap[machine.type] });
      return;
    }

    const machineRender = new MachineRender({
      text: this.iconMap[machine.type],
      x: i * 160,
      y: 100,
    });

    layer.add(machineRender);
  }
}

class MachineRender extends Konva.Text {
  constructor(...[options]: ConstructorParameters<typeof Konva.Text>) {
    super({
      ...options,
      fontSize: 20,
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
      originX: "center",
      originY: "center",
      hasControls: false,
      selectable: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });
  }
}
