import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  computed,
  contentChild,
  input,
  signal,
  TemplateRef,
} from "@angular/core";

@Component({
  selector: "app-panel-menu-nav",
  imports: [NgTemplateOutlet],
  template: `
    <div class="p-2 md:p-4 flex flex-col h-full pb-0!">
      <div
        class="w-full md:text-2xl text-xl flex flex-row items-center justify-around gap-4 h-4rem">
        @if (menuOptions().length > 1) {
          <button class="text pl-2!" (click)="previousMenu()">{{ "<" }}</button>
        }
        <h1 class="font-bold text-center ">
          {{ selectedMenu().text }}
        </h1>
        @if (menuOptions().length > 1) {
          <button class="text pr-2!" (click)="nextMenu()">{{ ">" }}</button>
        }
      </div>

      <div
        class="flex flex-col gap-4 pt-1 md:pt-4 items-start h-full w-full md:overflow-y-scroll overflow-y-scroll overflow-x-scroll">
        <div class="md:pb-4 w-full">
          <ng-container
            *ngTemplateOutlet="
              panelContent();
              context: { $implicit: selectedMenu() }
            ">
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export class PanelMenuNavComponent {
  panelContent = contentChild.required<TemplateRef<any>>("panelContent");

  menuOptions = input.required<string[]>();

  selectedMenuIndex = signal(0);
  selectedMenu = computed(() => {
    const selected = this.menuItems()?.[this.selectedMenuIndex()];
    return selected || this.menuItems()[0];
  });

  menuItems = computed(() => {
    let items = this.menuOptions().map((key) => {
      return {
        type: key,
        text: key,
      };
    });

    return items;
  });

  nextMenu() {
    let nextIndex = this.selectedMenuIndex() + 1;
    if (nextIndex >= this.menuItems().length) {
      nextIndex = 0;
    }
    this.selectedMenuIndex.set(nextIndex);
  }

  previousMenu() {
    let prevIndex = this.selectedMenuIndex() - 1;
    if (prevIndex < 0) {
      prevIndex = this.menuItems().length - 1;
    }

    this.selectedMenuIndex.set(prevIndex);
  }
}
