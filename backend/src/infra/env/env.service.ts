import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) { }

  get<K extends keyof Env>(key: K) {
    return this.configService.get(key, { infer: true });
  }
}