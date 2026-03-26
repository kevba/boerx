import { BarnService } from "../services/entities/barn.service";
import { BaseService } from "../services/entities/base.service";
import { CowService } from "../services/entities/cow.service";
import { FarmerService } from "../services/entities/farmer.service";
import { GreenhouseService } from "../services/entities/greenhouse.service";
import { MarketService } from "../services/entities/market.service";
import { PlotService } from "../services/entities/plots.service";
import { TractorService } from "../services/entities/tractor.service";
import { VanService } from "../services/entities/van.service";
import { WeatherControlService } from "../services/entities/weather-control.service";
import { WeatherStationService } from "../services/entities/weatherStation.service";
import { WindmillService } from "../services/entities/windmill.service";
import { EntityType } from "./entity";

export const EntityService: Record<EntityType, typeof BaseService<any, any>> = {
  [EntityType.Plot]: PlotService,
  [EntityType.Farmer]: FarmerService,
  [EntityType.Barn]: BarnService,
  [EntityType.Tractor]: TractorService,
  [EntityType.Van]: VanService,
  [EntityType.Market]: MarketService,
  [EntityType.Cow]: CowService,
  [EntityType.Greenhouse]: GreenhouseService,
  [EntityType.WeatherControl]: WeatherControlService,
  [EntityType.Windmill]: WindmillService,
  [EntityType.WeatherStation]: WeatherStationService,
};
