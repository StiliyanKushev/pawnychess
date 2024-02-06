import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import path from 'path';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  const mockRequestLocale = jest.fn();

  let baseLocaleSchema: any;
  let foreignLocaleSchemas: any;

  beforeAll(async () => {
    baseLocaleSchema = await import('../assets/locales/en.json');
    foreignLocaleSchemas = await Promise.all(
      fs
        .readdirSync(path.join(__dirname, '../assets/locales'))
        .filter((name) => /.+\.json/.test(name))
        .map(async (name) => await import(`../assets/locales/${name}`)),
    );
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        I18nService,
        {
          provide: REQUEST,
          useValue: {
            get localeCode() {
              return mockRequestLocale();
            },
          },
        },
      ],
    }).compile();

    service = await module.resolve<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should support string interpolation at runtime', () => {
    mockRequestLocale.mockReturnValue(undefined);
    expect(
      service.translate('greet.hello', { firstName: 'User' }),
    ).resolves.toEqual('Hello User');
  });

  it('should default to en if language is unsupported', () => {
    mockRequestLocale.mockReturnValue('abc');
    expect(service.translate('greet.hello')).resolves.toContain('Hello');
  });

  it('should default to en if no language is provided', () => {
    mockRequestLocale.mockReturnValue(undefined);
    expect(service.translate('greet.hello')).resolves.toContain('Hello');
  });

  it('should switch language if language is supported', () => {
    mockRequestLocale.mockReturnValue('bg');
    expect(service.translate('greet.hello')).resolves.toContain('Здравей');
  });

  it('should work with locale json files that are all alike', () => {
    const getStructure = (obj, prefix = '') =>
      Object.keys(obj)
        .reduce((res, el) => {
          const path = prefix ? `${prefix}.${el}` : el;
          if (
            typeof obj[el] === 'object' &&
            obj[el] !== null &&
            !Array.isArray(obj[el])
          ) {
            return [...res, path, ...getStructure(obj[el], path)];
          }
          return [...res, path];
        }, [])
        .sort();

    foreignLocaleSchemas.forEach((schema) => {
      expect(getStructure(schema)).toEqual(getStructure(baseLocaleSchema));
    });
  });
});
