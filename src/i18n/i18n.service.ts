import { Inject, Injectable, Scope } from '@nestjs/common';

import { REQUEST } from '@nestjs/core';
import type * as Schema from 'assets/locales/en.json';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import format from 'string-format';

/**
 * Cursed helper types to enforce strong types and auto completion when
 * using object paths in a string using the .dot syntax.
 */
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[]> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? `${F}.${Join<Extract<R, string[]>>}`
        : never
      : string;

/**
 * Durable request scoped service that exports functionality
 * for retrieving text based on the most appropriate locale.
 */
@Injectable({ scope: Scope.REQUEST, durable: true })
export class I18nService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public static readonly defaultLanguage = 'en';

  // TODO(convert to private field): conversion has to wait for ts(18036) to get fixed.
  // see: https://github.com/microsoft/TypeScript/issues/57309
  private static cachedSupportedLanguages: string[];

  public static get supportedLanguages(): string[] {
    if (I18nService.cachedSupportedLanguages) {
      return I18nService.cachedSupportedLanguages;
    }
    I18nService.cachedSupportedLanguages = fs
      .readdirSync(path.join(__dirname, '../assets/locales'))
      .filter((name) => /.+\.json/.test(name))
      .map((name) => name.slice(0, -5));
    return I18nService.supportedLanguages;
  }

  /**
   * This is the primary function to use whenever you want to
   * use some text data (defined in the assets/locales folder)
   * ensuring that the outcome fits the request's most fitting
   * accepted language.
   */
  async translate(
    key: Join<PathsToStringProps<typeof Schema>>,
    ...args: Array<string | Record<string, unknown>>
  ): Promise<string> {
    const text: string = key
      .split('.')
      .reduce((p, c) => p[c], await this.getTranslations());
    return format(text, ...args);
  }

  private get localeCode(): string {
    return this.request.localeCode ?? I18nService.defaultLanguage;
  }

  /**
   * This function will return the translation object for
   * the locale of the currently active context id.
   */
  #cachedTranslationsObject: typeof Schema;
  private async getTranslations(): Promise<typeof Schema> {
    if (this.#cachedTranslationsObject) {
      return this.#cachedTranslationsObject;
    }

    this.#cachedTranslationsObject = await import(
      `../assets/locales/${this.localeCode}.json`
    )
      .catch(() => null)
      .then(
        (res) =>
          res ?? // if above code was not found use default
          import(`../assets/locales/${I18nService.defaultLanguage}.json`),
      );
    return this.getTranslations();
  }
}
