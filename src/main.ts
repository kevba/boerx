import { EnvironmentInjector } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

export class AppInjectorHolder {
  static injector: EnvironmentInjector;
}

bootstrapApplication(AppComponent, appConfig)
  .then((injector) => {
    AppInjectorHolder.injector = injector.injector;
  })
  .catch((err) => console.error(err));
