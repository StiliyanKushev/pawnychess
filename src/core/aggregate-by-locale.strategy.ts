import {
  ContextId,
  ContextIdFactory,
  ContextIdResolver,
  ContextIdResolverFn,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';
import { pick } from 'accept-language-parser';
import { Request } from 'express';
import { I18nService } from 'i18n/i18n.service';

declare module 'express-serve-static-core' {
  interface Request {
    localeCode?: string;
  }
}

export class AggregateByLocaleContextIdStrategy implements ContextIdStrategy {
  private readonly locales = new Map<string, ContextId>();

  attach(
    contextId: ContextId,
    request: Request,
  ): ContextIdResolverFn | ContextIdResolver {
    const localeCode =
      pick(
        I18nService.supportedLanguages,
        request.headers['accept-language'] ?? '',
      ) ?? I18nService.defaultLanguage;

    let localeSubTreeId: ContextId;

    if (this.locales.has(localeCode)) {
      localeSubTreeId = this.locales.get(localeCode)!;
    } else {
      localeSubTreeId = ContextIdFactory.create();
      this.locales.set(localeCode, localeSubTreeId);
    }

    // append the local code to the request object
    request.localeCode = localeCode;

    return {
      payload: request,
      resolve: (info: HostComponentInfo) =>
        info.isTreeDurable ? localeSubTreeId : contextId,
    };
  }
}
