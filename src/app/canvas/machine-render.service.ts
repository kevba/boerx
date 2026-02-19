import { effect, inject, Injectable, signal } from "@angular/core";
import { Canvas, Text } from "fabric";
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
  canvas = signal<Canvas | undefined>(undefined);

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

    effect(() => {
      const canvas = this.canvas();
      if (!canvas) return;

      canvas.on("mouse:down", (e) => {
        if (e.target instanceof MachineRender) {
        }
      });
    });
  }

  private renderMachine(machine: Machine, i: number) {
    const canvas = this.canvas();
    if (!canvas) return;

    const drawnMachine = canvas
      .getObjects()
      .find((o) => o instanceof MachineRender && o.id === machine.id);

    if (drawnMachine) {
      drawnMachine.set({ text: this.iconMap[machine.type] });
      canvas.requestRenderAll();

      return;
    }

    const machineRender = new MachineRender(
      machine.id,
      this.iconMap[machine.type],
      {
        left: i * 160,
        top: 100,
      }
    );

    canvas.add(machineRender);
  }
}

class MachineRender extends Text {
  id: string;

  constructor(id: string, ...args: ConstructorParameters<typeof Text>) {
    super(args[0], {
      ...args[1],
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
    this.id = id;
  }
}
