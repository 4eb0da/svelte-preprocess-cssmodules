import { walk } from 'svelte/compiler';
import type { Ast, TemplateNode } from 'svelte/types/compiler/interfaces.d';
import type { PluginOptions } from '../types';
import Processor from './processor';

/**
 * The scoped style parser
 * @param processor The CSS Module Processor
 */
const parser = (processor: Processor): void => {
  const ast = (processor.ast as unknown) as TemplateNode;
  walk(ast, {
    enter(baseNode) {
      const node = baseNode as TemplateNode;
      if (node.type === 'Script' || node.type === 'Fragment') {
        this.skip();
      }
      if (node.type === 'ClassSelector') {
        const generatedClassName = processor.createModuleClassname(node.name);
        processor.addModule(node.name, generatedClassName);
        processor.magicContent.overwrite(node.start, node.end, `.${generatedClassName}`);
      }
    },
  });
};

const scopedProcessor = async (
  ast: Ast,
  content: string,
  filename: string,
  options: PluginOptions
): Promise<string> => {
  const processor = new Processor(ast, content, filename, options, parser);
  const processedContent = processor.parse();
  return processedContent;
};

export default scopedProcessor;
