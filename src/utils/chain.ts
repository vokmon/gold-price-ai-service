import { BaseOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { getChatGoogleGenerativeAI } from "./ai-model.ts";

export const getChain = async (promptTemplate: string, parser?: BaseOutputParser ) => {
  const prompt = await PromptTemplate.fromTemplate(promptTemplate);

  const llm = getChatGoogleGenerativeAI();
  return RunnableSequence.from([prompt, llm, parser || new StringOutputParser()]);
};
