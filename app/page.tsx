"use client";

import { useState } from "react";
import { ClientMessage } from "../lib/chat/actions";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>("");
  // const [conversation, setConversation] = useUIState();
  // const [titleText, setTitleText] = useUIState();
  // Combined UIState to handle title and conversation
  const [uiState, setUIState] = useUIState();
  const { continueConversation } = useActions();

  const { conversation = [], titleText = "" } = uiState;

  console.log("tC", conversation);
  // console.log('tT',titleText)

  return (
    <div>
      <h1>{titleText}</h1>
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            // First one to add user message to conversation
            setUIState((prevState: any) => {
              console.log("prever", prevState);
              return {
                ...prevState,
                conversation: [
                  ...prevState.conversation,
                  { id: nanoid(), role: "user", display: input },
                ],
              };
            });

            const message = await continueConversation(input);

            console.log("massage", message.display);

            // Second one to add message after continue conversation
            setUIState((prevState: any) => ({
              ...prevState,
              conversation: [...prevState.conversation, message],
              titleText: message.display, // Example of updating titleText
            }));
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
