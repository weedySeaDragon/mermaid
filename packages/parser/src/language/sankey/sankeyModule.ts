import type {
  DefaultSharedModuleContext,
  LangiumParser,
  LangiumServices,
  LangiumSharedServices,
  Module,
  PartialLangiumServices,
} from 'langium';
import { EmptyFileSystem, createDefaultModule, createDefaultSharedModule, inject } from 'langium';

import { MermaidGeneratedSharedModule, SankeyGeneratedModule } from '../generated/module.js';
import { CommonLexer } from '../common/lexer.js';
import { SankeyTokenBuilder } from './sankeyTokenBuilder.js';
import { SankeyValueConverter } from './sankeyValueConverter.js';
import { createSankeyParser } from './sankeyParser.js';

/**
 * Declaration of `Sankey` services.
 */
export type SankeyAddedServices = {
  parser: {
    LangiumParser: LangiumParser;
    Lexer: CommonLexer;
    TokenBuilder: SankeyTokenBuilder;
    ValueConverter: SankeyValueConverter;
  };
};

/**
 * Union of Langium default services and `Sankey` services.
 */
export type SankeyServices = LangiumServices & SankeyAddedServices;

/**
 * Dependency injection module that overrides Langium default services and
 * contributes the declared `Sankey` services.
 */
export const SankeyModule: Module<SankeyServices, PartialLangiumServices & SankeyAddedServices> = {
  parser: {
    LangiumParser: (services) => createSankeyParser(services),
    Lexer: (services) => new CommonLexer(services),
    TokenBuilder: () => new SankeyTokenBuilder(),
    ValueConverter: () => new SankeyValueConverter(),
  },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 * @param context - Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createSankeyServices(context: DefaultSharedModuleContext = EmptyFileSystem): {
  shared: LangiumSharedServices;
  Sankey: SankeyServices;
} {
  const shared: LangiumSharedServices = inject(
    createDefaultSharedModule(context),
    MermaidGeneratedSharedModule
  );
  const Sankey: SankeyServices = inject(
    createDefaultModule({ shared }),
    SankeyGeneratedModule,
    SankeyModule
  );
  shared.ServiceRegistry.register(Sankey);
  return { shared, Sankey };
}