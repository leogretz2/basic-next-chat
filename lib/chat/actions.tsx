"use server";

import {
  createAI,
  getMutableAIState,
  streamUI,
  getAIState,
  createStreamableValue,
} from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
// import { auth } from "@/auth"

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

const arr = ["1", "4", "6", "4456"];

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  "use server";

  const aiState = getMutableAIState();
  const { messages } = aiState.get();

  console.log("before", aiState.get());

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content: input,
      },
    ],
  });
  console.log("after", aiState.get());

  const result = await streamUI({
    model: openai("gpt-3.5-turbo"), // takes OPENAI_API_KEY from env by default
    messages: [...aiState.get().messages, { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        aiState.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      testTool: {
        description: "Test tool",
        parameters: z.object({
          difficulty: z.number().describe("Difficulty of question"),
        }),
        generate: async ({ difficulty }) => {
          // Perform some operations with difficulty and return a result
          console.log("in tool", difficulty);
          const result = `teebasdl is set to ${difficulty}`;
          return result;
        },
      },
    },
  });

  const titleText = arr[Math.floor(Math.random() * arr.length)];

  console.log("resulte!", result.value);

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

// export const AI = createAI<ServerMessage[], ClientMessage[]>({
export const AI = createAI<AIState, UIState>({
  actions: {
    continueConversation,
  },
  initialAIState: { chatId: nanoid(), messages: [], questionText: "test ai" },
  initialUIState: { messages: [], questionText: "Default Title" },
  onGetUIState: async () => {
    "use server";

    // const session = await auth()

    console.log("INGET");

    // if (session && session.user) {
    const aiState = getAIState();

    // Test: see what aiState is off the bat, work from there
    console.log("aiState", aiState);

    if (aiState) {
      const uiState = getUIStateFromAIState(aiState);
      return uiState;
    }
    // } else {
    //   return
    // }
  },
  onSetAIState: async ({ state, done }: { state: AIState; done: boolean }) => {
    "use server";

    // const session = await auth()
    console.log("in setai", state.messages);

    // Test: add session back in (seems like only to save in kv database...)
    // if (session && session.user) {
    //   const { chatId, messages } = state;

    //   const createdAt = new Date();
    //   const userId = "testUserId"; //session?.user?.id as string;
    //   const path = `/chat/${chatId}`;
    //   const title = messages[0].content.substring(0, 100);

    //   const chat: Chat = {
    //     id: chatId,
    //     title,
    //     userId,
    //     createdAt,
    //     messages,
    //     path,
    //   };

    //   console.log("in setai after", chat.messages);

    //   await saveChat(chat);
    // } else {
    //   return;
    // }
  },
});

export type UIState = {
  messages: Message[];
  // id: string
  // display: React.ReactNode
  // messages: Message[],
  // Test: AIState updates UIState - why isn't messages' type Message[]?
  // messages: {id: string, display: React.ReactNode}[];
  questionText?: string;
  // Add possibleAnswers in later
  // possibleAnswers: PossibleAnswers;
};

export type AIState = {
  chatId: string;
  messages: Message[];
  questionText?: string;
  // possibleAnswers?: PossibleAnswers
};

export type Message = {
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  id: string;
  name?: string; // What's the purpose of this?
};

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  path: string;
  messages: Message[];
  sharePath?: string;
}

function getUIStateFromAIState(aiState: AIState): UIState {
  console.log("in getUIStateFromAIState", aiState);
  const { messages, questionText } = aiState;

  // Return the UI state (components) I think div
  const uiState: UIState = {
    messages,
    questionText,
    // possibleAnswers: [],
  };

  return uiState;
}
